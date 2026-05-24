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

export async function transferRoomToMloQueue({ roomName }: { roomName: string }) {
  if (!roomName) {
    throw new Error('roomName is required');
  }

  const livekitHost = requiredEnv('LIVEKIT_URL').replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');

  const sipClient = new SipClient(
    livekitHost,
    requiredEnv('LIVEKIT_API_KEY'),
    requiredEnv('LIVEKIT_API_SECRET')
  );

  try {
    const participant = await sipClient.createSipParticipant(
      requiredEnv('SIP_TRUNK_SID'),
      requiredEnv('SIP_CALL_TO'),
      roomName,
      {
        participantIdentity: `sip-fspbx-${roomName}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 90),
        participantName: `FSPBX ${requiredEnv('SIP_CALL_TO')}`,
        ...(process.env.SIP_FROM_NUMBER ? { fromNumber: process.env.SIP_FROM_NUMBER } : {}),
        playRingtone: false
      }
    );

    return {
      success: true,
      participantId: participant.participantId || (participant as any).sipParticipantId,
      participantIdentity: participant.participantIdentity,
      sipCallId: participant.sipCallId,
    };
  } catch (error: any) {
    throw new Error(`LiveKit to SignalWire SIP Handshake Failed: ${error.message}`);
  }
}
