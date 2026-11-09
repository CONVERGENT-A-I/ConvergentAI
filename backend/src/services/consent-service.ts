/**
 * Section 0 (S0-26): consent recorded when the borrower taps a channel card on the first screen.
 *
 * One tap = two consent events: AI engagement and recording. Each carries the session (room), timestamp,
 * lender, channel and disclosure version (spoken and on-screen). The `[consent]` log line is always
 * written. The database rows need the `AI_ENGAGEMENT` and `RECORDING` values in the `ConsentType`
 * enum (a migration, see Section0_DatabasePlan_MuhammadH.md, Step 8); until then the write is skipped
 * with a log line and the conversation is never affected.
 */
import { prisma } from './database.js';
import { applicationService } from './application-service.js';

export const DISCLOSURE_VERSION = 's0-2026-11-v1';

/** On-screen consent line under the channel cards (approved by David, Nov 2026). */
export const ON_SCREEN_CONSENT_TEXT =
  'Ailana is an AI assistant, not a person. By choosing an option, you agree to talk with Ailana and that this conversation, including video, voice and chat, is recorded for quality and compliance.';

/** Spoken recording notice in the greeting (approved; enough for voice-only callers per David). */
export const SPOKEN_CONSENT_TEXT =
  'Just so you know, our conversation is recorded for quality and compliance, and by continuing, you agree to that.';

const CHANNELS = new Set(['video', 'voice', 'avatar-chat', 'loan-officer']);

export interface ChannelConsentInput {
  roomName: string;
  channel: string;
  ipAddress: string;
  userAgent?: string | undefined;
}

export type ConsentResult = { ok: true; stored: boolean } | { ok: false; error: string };

export async function recordChannelConsents(input: ChannelConsentInput): Promise<ConsentResult> {
  const { roomName, channel } = input;
  if (!roomName || !CHANNELS.has(channel)) return { ok: false, error: 'roomName and a valid channel are required' };
  const at = new Date();
  const lender = process.env.LENDER_NAME || 'unset';
  const meta = {
    roomName, channel, lender, disclosureVersion: DISCLOSURE_VERSION,
    spokenText: SPOKEN_CONSENT_TEXT, onScreenText: ON_SCREEN_CONSENT_TEXT, recordedAt: at.toISOString(),
  };
  for (const type of ['ai_engagement', 'recording']) {
    console.log(`[consent] ${type} accepted · room=${roomName} · channel=${channel} · lender=${lender} · version=${DISCLOSURE_VERSION} · at=${at.toISOString()}`);
  }

  if (!prisma) return { ok: true, stored: false };
  try {
    const app = await applicationService.findApplicationByRoomName(roomName);
    if (!app?.id) {
      console.log('[consent] no application row for this room yet — rows not stored (log line kept)');
      return { ok: true, stored: false };
    }
    await prisma.consent.createMany({
      data: ['AI_ENGAGEMENT', 'RECORDING'].map((consentType) => ({
        applicationId: app.id,
        consentType,
        status: 'ACCEPTED',
        disclosureText: consentType === 'RECORDING' ? `${SPOKEN_CONSENT_TEXT} | ${ON_SCREEN_CONSENT_TEXT}` : ON_SCREEN_CONSENT_TEXT,
        presentedAt: at,
        respondedAt: at,
        ipAddress: input.ipAddress || 'unknown',
        userAgent: input.userAgent ?? null,
        metadata: meta,
      })),
    });
    return { ok: true, stored: true };
  } catch (err) {
    // Most likely the ConsentType enum has no AI_ENGAGEMENT / RECORDING yet (migration pending).
    console.warn('[consent] database write skipped:', (err as Error)?.message?.split('\n')[0]);
    return { ok: true, stored: false };
  }
}
