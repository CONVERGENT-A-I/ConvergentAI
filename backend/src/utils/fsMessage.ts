/**
 * Send a SIP MESSAGE to a registered extension via FreeSWITCH, by firing a
 * CUSTOM "SMS::SEND_MESSAGE" event over the Event Socket (ESL). This is the
 * mechanism documented by mod_sms for sending a message from a script/ESL —
 * FreeSWITCH then relays the MESSAGE to ALL of the extension's registered
 * contacts (Linphone, Ringotel, desk phones).
 *
 * The `chat` api command does NOT work for this (it only runs the chatplan and
 * does not relay to registered endpoints — it returns "Message Not Sent").
 *
 * Best-effort and fully optional: if FS_ESL_HOST is not set, or the socket is
 * unreachable, it resolves false and the caller continues.
 *
 * Required env to enable:
 *   FS_ESL_HOST       e.g. 192.168.10.10  (FreeSWITCH host reachable from backend)
 *   FS_ESL_PORT       default 8021
 *   FS_ESL_PASSWORD   required; store in a Kubernetes Secret
 * Optional:
 *   FS_MESSAGE_FROM   default 1100        (a valid local user to appear as sender)
 *   FS_SIP_PROFILE    default internal    (sofia profile name)
 */
import net from 'net';

export function sendSipMessage(
  toExt: string,
  domain: string,
  body: string,
  timeoutMs = 5000
): Promise<boolean> {
  const host = process.env.FS_ESL_HOST;
  const password = process.env.FS_ESL_PASSWORD;
  if (!host || !password) return Promise.resolve(false); // feature disabled

  const port = Number(process.env.FS_ESL_PORT || 8021);
  const from = process.env.FS_MESSAGE_FROM || '1100';
  const profile = process.env.FS_SIP_PROFILE || 'internal';
  const debug = (msg: string) =>
    console.warn(`[fsMessage] ${toExt}@${domain}: ${msg}`);

  const safeBody = String(body).trim();
  const bodyLen = Buffer.byteLength(safeBody, 'utf8');

  // Build the sendevent payload (mod_sms SMS::SEND_MESSAGE). Headers mirror the
  // working luarun example; the body is length-delimited via Content-Length.
  const headers = [
    'sendevent CUSTOM',
    'Event-Subclass: SMS::SEND_MESSAGE',
    'proto: sip',
    'dest_proto: sip',
    `from: ${from}@${domain}`,
    `from_full: sip:${from}@${domain}`,
    `to: ${toExt}@${domain}`,
    'type: text/plain',
    `sip_profile: ${profile}`,
    `Content-Length: ${bodyLen}`,
  ].join('\n');
  const payload = `${headers}\n\n${safeBody}`;

  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let buffer = '';
    let authed = false;
    let sent = false;
    let done = false;

    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      try { socket.destroy(); } catch { /* noop */ }
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.on('timeout', () => { debug(`ESL timeout to ${host}:${port}`); finish(false); });
    socket.on('error', (e) => { debug(`ESL connect error to ${host}:${port}: ${(e as Error).message}`); finish(false); });
    socket.connect(port, host);

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');

      // Step 1: server asks for auth.
      if (!authed && buffer.includes('auth/request')) {
        buffer = '';
        socket.write(`auth ${password}\n\n`);
        return;
      }
      // Step 2: auth reply -> fire the event.
      if (!authed && buffer.includes('command/reply')) {
        authed = buffer.includes('+OK');
        buffer = '';
        if (!authed) { debug('ESL auth failed (check FS_ESL_PASSWORD)'); finish(false); return; }
        socket.write(payload);
        sent = true;
        return;
      }
      // Step 3: reply to sendevent -> done.
      if (authed && sent && buffer.includes('command/reply')) {
        const ok = buffer.includes('+OK');
        if (!ok) debug(`sendevent rejected: ${buffer.trim().slice(0, 120)}`);
        finish(ok);
      }
    });
  });
}
