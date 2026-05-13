import { SipClient, TwirpError } from 'livekit-server-sdk';
import type { CreateSipParticipantOptions } from 'livekit-server-sdk';

// ─── Env helpers ──────────────────────────────────────────────────────────────

function normalizeLiveKitUrl(url: string): string {
  return url.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[transfer] Missing required environment variable: ${name}`);
  }
  return value;
}

function boolEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (!value) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function numberEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const value = Number(raw);
  return Number.isFinite(value) ? value : defaultValue;
}

// ─── Validate SIP env vars on import (fail-fast) ─────────────────────────────

const SIP_ENV_VARS = [
  'LIVEKIT_URL',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'SIP_TRUNK_SID',
  'SIP_CALL_TO',
  'SIP_FROM_NUMBER',
] as const;

const missingSipVars = SIP_ENV_VARS.filter((v) => !process.env[v]);
if (missingSipVars.length > 0) {
  console.warn(
    `[transfer] ⚠ Missing SIP env vars: ${missingSipVars.join(', ')}. ` +
    `MLO transfer will fail at runtime.`
  );
}

// ─── Transfer result type ─────────────────────────────────────────────────────

export interface TransferResult {
  success: boolean;
  sipParticipantId: string;
  participantIdentity: string;
  sipCallId: string;
}

// ─── Main transfer function ───────────────────────────────────────────────────

/**
 * Creates a SIP participant in an existing LiveKit room, dialling the
 * SignalWire SWML endpoint which bridges to the FSPBX MLO queue (ext 2001).
 *
 * Call chain:
 *   LiveKit Room → SIP Trunk → SignalWire SWML → FSPBX → Ring Group 2001
 */
export async function transferRoomToMloQueue({
  roomName,
  userIdentity,
}: {
  roomName: string;
  userIdentity?: string;
}): Promise<TransferResult> {
  if (!roomName) {
    throw new Error('[transfer] roomName is required');
  }

  const sipClient = new SipClient(
    normalizeLiveKitUrl(requiredEnv('LIVEKIT_URL')),
    requiredEnv('LIVEKIT_API_KEY'),
    requiredEnv('LIVEKIT_API_SECRET'),
  );

  const opts: CreateSipParticipantOptions = {
    participantIdentity: `mlo-link-${roomName.substring(0, 10)}`,
    participantName: process.env['SIP_PARTICIPANT_NAME'] ?? 'Loan Officer',
    playDialtone: false,
    waitUntilAnswered: boolEnv('SIP_WAIT_UNTIL_ANSWERED', true),
    ringingTimeout: numberEnv('SIP_RINGING_TIMEOUT_SECONDS', 45),
    headers: {
      'X-Transfer-Source': 'livekit-agent-transfer',
      'X-Transfer-From': userIdentity ?? 'unknown',
      'X-Queue-Extension': '2001',
    },
  };

  const fromNumber = process.env['SIP_FROM_NUMBER'];
  if (fromNumber) {
    opts.fromNumber = fromNumber;
  }

  try {
    console.log(
      `[transfer] Initiating SIP transfer for room "${roomName}" ` +
      `(user: ${userIdentity ?? 'unknown'}) → trunk ${requiredEnv('SIP_TRUNK_SID')}`
    );

    const participant = await sipClient.createSipParticipant(
      requiredEnv('SIP_TRUNK_SID'),
      requiredEnv('SIP_CALL_TO'),
      roomName,
      opts,
    );

    console.log('[transfer] ✓ SIP participant created:', {
      participantId: participant.participantId,
      participantIdentity: participant.participantIdentity,
      sipCallId: participant.sipCallId,
    });

    return {
      success: true,
      sipParticipantId: participant.participantId ?? '',
      participantIdentity: participant.participantIdentity ?? '',
      sipCallId: participant.sipCallId ?? '',
    };
  } catch (error: unknown) {
    const err = error as any;
    const sipStatus = err.metadata?.['sip_status_code'] ?? 'unknown';
    const sipReason = err.metadata?.['sip_status'] ?? 'unknown reason';
    const message = err.message ?? String(error);

    console.error(
      `[transfer] ✗ SIP transfer failed: ${message} ` +
      `(SIP ${sipStatus}: ${sipReason})`
    );

    throw new Error(`SIP_ERROR_${sipStatus}: ${sipReason}`);
  }
}
