import { SipClient, TwirpError } from 'livekit-server-sdk';

function normalizeLiveKitUrl(url: string) {
  return url.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function boolEnv(name: string, defaultValue: boolean) {
  const value = process.env[name];
  if (!value) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function numberEnv(name: string, defaultValue: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : defaultValue;
}

export async function transferRoomToMloQueue({ roomName, userIdentity }: { roomName: string, userIdentity?: string }) {
  if (!roomName) {
    throw new Error('roomName is required');
  }

  const sipClient = new SipClient(
    normalizeLiveKitUrl(requiredEnv('LIVEKIT_URL')),
    requiredEnv('LIVEKIT_API_KEY'),
    requiredEnv('LIVEKIT_API_SECRET')
  );

  try {
    console.log(`[sipTransfer] Creating SIP participant for room: ${roomName}, userIdentity: ${userIdentity}`);
    console.log(`[sipTransfer] SIP parameters: SIP_TRUNK_SID=${requiredEnv('SIP_TRUNK_SID')}, SIP_CALL_TO=${requiredEnv('SIP_CALL_TO')}`);
    const participant = await sipClient.createSipParticipant(
      requiredEnv('SIP_TRUNK_SID'),
      requiredEnv('SIP_CALL_TO'),
      roomName,
      {
        participantIdentity: `mlo-queue-${Date.now()}`,
        participantName: process.env.SIP_PARTICIPANT_NAME || 'MLO Queue',
        ...(process.env.SIP_FROM_NUMBER ? { fromNumber: process.env.SIP_FROM_NUMBER } : {}),
        playDialtone: true,
        waitUntilAnswered: boolEnv('SIP_WAIT_UNTIL_ANSWERED', true),
        ringingTimeout: numberEnv('SIP_RINGING_TIMEOUT_SECONDS', 45),
        headers: {
          'X-Transfer-Source': 'livekit-agent-transfer',
          'X-Transfer-From': userIdentity || 'unknown',
          'X-Queue-Extension': '2001',
        },
      }
    );

    console.log(`[sipTransfer] SIP participant created successfully. ID: ${participant.participantId}, Identity: ${participant.participantIdentity}, CallId: ${participant.sipCallId}`);

    return {
      success: true,
      participantId: participant.participantId,
      participantIdentity: participant.participantIdentity,
      sipCallId: participant.sipCallId,
    };
  } catch (error) {
    if (error instanceof TwirpError) {
      throw new Error(
        `LiveKit SIP transfer failed: ${error.message}; ` +
        `SIP status=${(error as any).metadata?.sip_status_code || 'unknown'} ` +
        `${(error as any).metadata?.sip_status || ''}`
      );
    }

    throw error;
  }
}
