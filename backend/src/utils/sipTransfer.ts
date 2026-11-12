import { SipClient, RoomServiceClient } from 'livekit-server-sdk';
import { resolveQueueForZip } from '../lib/zipResolver.js';
import { safeErrorMessage } from './security.js';

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizedSipFromNumber(): string | undefined {
  const configured = process.env.SIP_FROM_NUMBER?.trim();
  if (!configured) return undefined;

  // Unquoted YAML values such as 14238931776 are sometimes rendered by
  // Kubernetes as `1.4238931776e+10`. That is not a valid SIP From user and
  // FusionPBX commonly rejects the INVITE with 403. Recover the exact integer
  // when it is still within JavaScript's safe integer range.
  let normalized = configured;
  if (/^\d+(?:\.\d+)?e[+-]?\d+$/i.test(normalized)) {
    const numeric = Number(normalized);
    if (Number.isSafeInteger(numeric)) normalized = String(numeric);
  }

  normalized = normalized.replace(/[\s().-]/g, '');
  if (!/^\+?\d{3,15}$/.test(normalized)) {
    console.warn(`[sipTransfer]: ignoring invalid SIP_FROM_NUMBER=${JSON.stringify(configured)}; using outbound trunk default`);
    return undefined;
  }
  if (normalized !== configured) {
    console.warn(`[sipTransfer]: normalized SIP_FROM_NUMBER ${JSON.stringify(configured)} -> ${JSON.stringify(normalized)}`);
  }
  return normalized;
}

// ---------------------------------------------------------------------------
// Ringotel pre-call alert (same 2-step session flow as the standalone demo)
// ---------------------------------------------------------------------------
const ringotelSessions = new Map<string, string>();

async function ringotelPost(payload: unknown): Promise<any> {
  const url = process.env.RINGOTEL_API_URL;
  const token = process.env.RINGOTEL_AUTH_TOKEN;
  if (!url || !token) throw new Error('ringotel_not_configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const raw = await res.text();
  let data: any = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw }; }
  if (!res.ok) {
    const detail = String(data?.error?.message || data?.error || data?.message || data?.raw || '')
      .replace(/[\r\n]+/g, ' ')
      .slice(0, 300);
    throw new Error(`ringotel_http_${res.status}${detail ? `: ${detail}` : ''}`);
  }
  if (data?.error) {
    throw new Error(`ringotel_api_error: ${String(data.error?.message || data.error).slice(0, 300)}`);
  }
  return data?.result ?? data;
}

async function createRingotelSession(ext: string): Promise<string> {
  const orgid = process.env.RINGOTEL_ORG_ID;
  const from = process.env.RINGOTEL_MESSAGE_FROM || process.env.FS_MESSAGE_FROM || '1100';
  // Ringotel requires session creation WITHOUT content. Supplying content in
  // this first request can make the API return HTTP 500.
  const result = await ringotelPost({
    method: 'message',
    params: { orgid, from, to: ext },
  });
  const sessionid = String(result?.sessionid || '');
  if (!sessionid) throw new Error('ringotel_missing_sessionid');
  ringotelSessions.set(ext, sessionid);
  console.log('[RINGOTEL_SESSION_CREATED]', { ext });
  return sessionid;
}

export async function sendRingotelAlert(extension: string, body: string): Promise<boolean> {
  if (!process.env.RINGOTEL_API_URL || !process.env.RINGOTEL_AUTH_TOKEN) {
    console.warn('[RINGOTEL] not configured — skipping alert');
    return false;
  }
  const orgid = process.env.RINGOTEL_ORG_ID;
  const ext = String(extension);
  console.log('[RINGOTEL_SEND]', { ext });
  try {
    let sessionid = ringotelSessions.get(ext) || await createRingotelSession(ext);
    let result: any;
    try {
      result = await ringotelPost({
        method: 'message',
        params: { orgid, sessionid, content: body },
      });
    } catch (firstError) {
      // A process-local cached session can become stale. Recreate it once and
      // retry the content request before declaring delivery failed.
      ringotelSessions.delete(ext);
      console.warn('[RINGOTEL_RETRY_NEW_SESSION]', { ext, reason: safeErrorMessage(firstError) });
      sessionid = await createRingotelSession(ext);
      result = await ringotelPost({
        method: 'message',
        params: { orgid, sessionid, content: body },
      });
    }
    console.log('[RINGOTEL_OK]', { ext, messageid: result?.messageid });
    return true;
  } catch (err) {
    // Session may be stale → clear cache; best-effort, never block the call
    ringotelSessions.delete(ext);
    console.warn('[RINGOTEL_ERROR]', (err as Error).message);
    return false;
  }
}

// Alert the agents belonging to the exact queue selected for this transfer.
// This is deliberately performed at transfer time: an early browser alert may
// be absent when the ZIP is learned later in the voice conversation.
const transferAlerts = new Map<string, number>();

async function alertMappedQueueAgents({
  roomName,
  zip,
  queueExtension,
  queueName,
  stateCode,
}: {
  roomName: string;
  zip: string;
  queueExtension: string;
  queueName: string | null;
  stateCode: string | null;
}): Promise<void> {
  const dedupeKey = `${roomName}:${queueExtension}`;
  const now = Date.now();
  const lastSentAt = transferAlerts.get(dedupeKey) || 0;
  if (now - lastSentAt < 10 * 60_000) {
    console.log(`[transfer-alert]: duplicate suppressed for queue ${queueExtension} room ${roomName}`);
    return;
  }
  transferAlerts.set(dedupeKey, now);

  try {
    const [{ getQueueMembers }, { sendSipMessage }] = await Promise.all([
      import('../services/freeswitch-esl.js'),
      import('./fsMessage.js'),
    ]);
    const members = await getQueueMembers(queueExtension);
    const extensions = [...new Set(members.map((member) => member.extension).filter(Boolean))];
    if (extensions.length === 0) {
      console.warn(`[transfer-alert]: no agents found for queue ${queueExtension}`);
      return;
    }

    let domain = process.env.FS_DOMAIN || 'fspbx.convergentai.tech';
    for (const member of members) {
      const match = member.contact?.match(/@([\w.-]+)/);
      if (match?.[1]) domain = match[1];
    }
    const resolvedState = stateCode || 'unknown state';
    const defaultBody = `Incoming customer transfer for ZIP ${zip}: ${queueName || 'Loan Officer queue'} (${queueExtension}), ${resolvedState}.`;
    const body = (process.env.RINGOTEL_TRANSFER_ALERT_MSG || process.env.RINGOTEL_ALERT_MSG || defaultBody)
      .split('{zipCode}').join(zip)
      .split('{zip}').join(zip)
      .split('{state}').join(resolvedState)
      .split('{queueName}').join(queueName || 'Loan Officer queue')
      .split('{queueNumber}').join(queueExtension);

    let ringotelCount = 0;
    let sipCount = 0;
    const results = await Promise.allSettled(extensions.map(async (extension) => {
      const [ringotel, sip] = await Promise.allSettled([
        sendRingotelAlert(extension, body),
        sendSipMessage(extension, domain, body),
      ]);
      const ringotelOk = ringotel.status === 'fulfilled' && ringotel.value;
      const sipOk = sip.status === 'fulfilled' && sip.value;
      if (ringotelOk) ringotelCount++;
      if (sipOk) sipCount++;
      if (!ringotelOk && !sipOk) throw new Error('both alert channels failed');
    }));
    const reached = extensions.filter((_, index) => results[index]?.status === 'fulfilled');
    const failed = extensions.filter((_, index) => results[index]?.status !== 'fulfilled');
    console.log(
      `[transfer-alert]: queue ${queueExtension} reached ${reached.length}/${extensions.length} ` +
      `(ringotel ${ringotelCount}/${extensions.length}, sip ${sipCount}/${extensions.length}) ` +
      `[${reached.join(',')}]${failed.length ? ` | failed [${failed.join(',')}]` : ''} (zip ${zip})`
    );
  } catch (error) {
    console.error(`[transfer-alert]: queue ${queueExtension} failed: ${safeErrorMessage(error)}`);
  }
}

export async function transferRoomToMloQueue({
  roomName,
  zip,
  userIdentity,
}: {
  roomName: string;
  zip?: string;
  userIdentity?: string;
}) {
  if (!roomName) {
    throw new Error('roomName is required');
  }

  // Destination is decided ONLY by the customer's zip. No static-queue fallback:
  // if the zip is missing/invalid or not served by any agent, the transfer fails
  // (UNSUPPORTED_AREA) and the caller is expected to end the call.
  if (!zip || !/^\d{5}$/.test(zip)) {
    throw new Error('UNSUPPORTED_AREA: missing or invalid zip');
  }

  const queue = await resolveQueueForZip(zip);
  if (!queue) {
    throw new Error(`UNSUPPORTED_AREA: no queue for zip ${zip}`);
  }

  // Dial the call-center QUEUE (e.g. 7042 for TN), not a single agent. The queue
  // plays its greeting, distributes to licensed agents, and on no-answer follows
  // its timeout action (voicemail).
  const callTo = queue.queueExtension;
  const routedAgentName: string | null = queue.queueName;
  console.log(`[sipTransfer]: zip ${zip} -> state ${queue.stateCode} -> queue ${callTo} (${routedAgentName ?? 'unnamed'})${userIdentity ? ` [caller ${userIdentity}]` : ''}`);

  // Start a second, authoritative alert at transfer time. It targets the queue
  // members resolved from this ZIP and is independent of the browser's optional
  // early-alert request. Alert failures never cancel the telephone transfer.
  const alertPromise = alertMappedQueueAgents({
    roomName,
    zip,
    queueExtension: callTo,
    queueName: routedAgentName,
    stateCode: queue.stateCode,
  });

  // Alerts are best-effort and must never hold the SIP critical path. When an
  // intentional pre-dial pause is configured, use that pause as the complete
  // budget; otherwise start dialing immediately while notifications continue.
  const delayMs = Number(process.env.RINGOTEL_DELAY_MS || 0);
  if (delayMs > 0) {
    console.log(`[sipTransfer]: waiting ${delayMs}ms before SIP dial`);
    void alertPromise.catch((error) =>
      console.warn(`[transfer-alert]: background delivery failed: ${safeErrorMessage(error)}`)
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  } else {
    void alertPromise.catch((error) =>
      console.warn(`[transfer-alert]: background delivery failed: ${safeErrorMessage(error)}`)
    );
  }

  const livekitHost = requiredEnv('LIVEKIT_URL')
    .replace(/^wss:\/\//, 'https://')
    .replace(/^ws:\/\//, 'http://');

  const sipClient = new SipClient(
    livekitHost,
    requiredEnv('LIVEKIT_API_KEY'),
    requiredEnv('LIVEKIT_API_SECRET')
  );
  const fromNumber = normalizedSipFromNumber();
  const ringingTimeout = Number(
    process.env.SIP_RINGING_TIMEOUT_SECONDS ||
    process.env.SIP_RINGING_TIMEOUT ||
    60
  );
  const effectiveRingingTimeout = Number.isFinite(ringingTimeout)
    ? Math.min(80, Math.max(5, ringingTimeout))
    : 60;
  console.log(
    `[sipTransfer]: pre-answer timeout=${effectiveRingingTimeout}s; after the queue answers, FSPBX Max Wait Time controls disconnect`
  );

  try {
    const participant = await sipClient.createSipParticipant(
      requiredEnv('SIP_TRUNK_SID'),
      callTo,
      roomName,
      {
        participantIdentity: `sip-fspbx-${roomName}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 90),
        participantName: routedAgentName ? `${routedAgentName} (${callTo})` : `FSPBX ${callTo}`,
        ...(fromNumber ? { fromNumber } : {}),
        // Block until the agent actually ANSWERS. If they decline, are busy, or
        // ignore the call, createSipParticipant REJECTS — which bubbles up and
        // triggers the end-call flow instead of leaving the caller hanging.
        waitUntilAnswered: true,
        // This covers SIP/trunk setup only. FusionPBX answers on behalf of the
        // queue, so the human answer timeout is enforced separately over ESL.
        ringingTimeout: effectiveRingingTimeout,
        // Play ringback to the caller while we wait for the agent to pick up.
        playDialtone: true,
      }
    );

    return {
      success: true,
      dialedExtension: callTo,
      agentName: routedAgentName,
      participantId: participant.participantId || (participant as any).sipParticipantId,
      participantIdentity: participant.participantIdentity,
      sipCallId: participant.sipCallId,
    };
  } catch (error: any) {
    const code = error?.sipStatusCode ?? error?.statusCode;
    const status = error?.sipStatus ?? error?.status;
    const suffix = code || status ? ` [upstream=${code ?? '?'} ${status ?? ''}]` : '';
    throw new Error(`LiveKit to SIP Handshake Failed: ${error.message}${suffix}`);
  }
}

// Remove a participant (e.g. the SIP leg to the agent's phone) from the room.
// Removing the SIP participant terminates the call so the agent's device stops
// ringing / drops immediately when the browser caller hangs up.
// Delete the whole room: drops the SIP leg AND the agent, and closes the
// LiveKit session immediately so it doesn't linger as "in progress".
export async function deleteMloRoom(roomName: string): Promise<void> {
  if (!roomName) return;
  const host = requiredEnv('LIVEKIT_URL')
    .replace(/^wss:\/\//, 'https://')
    .replace(/^ws:\/\//, 'http://');
  const rsc = new RoomServiceClient(
    host,
    requiredEnv('LIVEKIT_API_KEY'),
    requiredEnv('LIVEKIT_API_SECRET')
  );
  await rsc.deleteRoom(roomName);
}

export async function hangupMloParticipant(roomName: string, identity: string): Promise<void> {
  if (!roomName || !identity) return;
  const host = requiredEnv('LIVEKIT_URL')
    .replace(/^wss:\/\//, 'https://')
    .replace(/^ws:\/\//, 'http://');
  const rsc = new RoomServiceClient(
    host,
    requiredEnv('LIVEKIT_API_KEY'),
    requiredEnv('LIVEKIT_API_SECRET')
  );
  await rsc.removeParticipant(roomName, identity);
}
