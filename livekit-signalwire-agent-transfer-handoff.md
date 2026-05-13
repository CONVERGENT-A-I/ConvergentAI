# LiveKit Agent to SignalWire/FSPBX Transfer Handoff

This is the working SIP-only transfer path for sending an active LiveKit room to the FSPBX MLO queue.

```text
LiveKit Agent/Backend
-> LiveKit outbound SIP trunk
-> SignalWire SWML SIP Address
-> SignalWire SWML Script
-> FSPBX SIP URI
-> Ring Group / Queue 2001
```

No PSTN destination is used. The SignalWire number is only used as the SIP caller ID / From identity.

## LiveKit Trunk Settings

Create or use this LiveKit outbound SIP trunk:

```text
Trunk name: SignalWire SWML MLO Queue Trunk
Trunk ID: ST_JA7tUGjFUZ9K
Direction: Outbound
Address: convergentai-livekit-mlo-queue.dapp.signalwire.com
Numbers: +12017404497
Transport: Auto
Authentication: none
Media encryption: disabled or optional
```

JSON form:

```json
{
  "trunk": {
    "name": "SignalWire SWML MLO Queue Trunk",
    "address": "convergentai-livekit-mlo-queue.dapp.signalwire.com",
    "numbers": ["+12017404497"],
    "transport": 3
  }
}
```

## SignalWire Setup

SignalWire SWML Script:

```text
Name: LiveKit MLO Queue Forward
SIP Address: sip:livekit-mlo-queue@convergentai-livekit-mlo-queue.dapp.signalwire.com
Context: Public
Channel: Audio
```

SWML script:

```json
{
  "version": "1.0.0",
  "sections": {
    "main": [
      {
        "connect": {
          "answer_on_bridge": true,
          "from": "+12017404497",
          "to": "sip:2001@fspbx.convergentai.tech:7000;transport=udp",
          "username": "1101",
          "password": "FSPBX_1101_PASSWORD",
          "encryption": "forbidden",
          "codecs": "PCMU,PCMA",
          "timeout": 90
        }
      }
    ]
  }
}
```

Use the real FSPBX extension password in SignalWire only. Do not commit it to application code.

## FSPBX Setup

```text
SIP domain: fspbx.convergentai.tech
SIP port: 7000
Transport: UDP
Auth extension used by SignalWire: 1101
Queue / ring group extension: 2001
Queue members: 1101, 1102
```

Recommended queue settings:

```text
Ring duration: 30-60 seconds
Confirm answer: disabled for initial SIP bridge testing
```

## Required App Environment Variables

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

SIP_TRUNK_SID=ST_JA7tUGjFUZ9K
SIP_CALL_TO=livekit-mlo-queue
SIP_FROM_NUMBER=+12017404497
SIP_PARTICIPANT_NAME=MLO Queue
SIP_WAIT_UNTIL_ANSWERED=true
SIP_RINGING_TIMEOUT_SECONDS=45
```

`SIP_CALL_TO` is the user part of the SignalWire SIP Address:

```text
sip:livekit-mlo-queue@convergentai-livekit-mlo-queue.dapp.signalwire.com
```

## Install Dependency

```bash
npm install livekit-server-sdk
```

## Copy-Ready Node.js Transfer Code

Use this in the Agent backend when the user clicks the transfer button or when your app explicitly requests transfer.

```js
'use strict';

const { SipClient, TwirpError } = require('livekit-server-sdk');

function normalizeLiveKitUrl(url) {
  return url.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function boolEnv(name, defaultValue) {
  const value = process.env[name];
  if (!value) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function numberEnv(name, defaultValue) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : defaultValue;
}

async function transferRoomToMloQueue({ roomName, userIdentity }) {
  if (!roomName) {
    throw new Error('roomName is required');
  }

  const sipClient = new SipClient(
    normalizeLiveKitUrl(requiredEnv('LIVEKIT_URL')),
    requiredEnv('LIVEKIT_API_KEY'),
    requiredEnv('LIVEKIT_API_SECRET')
  );

  try {
    const participant = await sipClient.createSipParticipant(
      requiredEnv('SIP_TRUNK_SID'),
      requiredEnv('SIP_CALL_TO'),
      roomName,
      {
        participantIdentity: `mlo-queue-${Date.now()}`,
        participantName: process.env.SIP_PARTICIPANT_NAME || 'MLO Queue',
        fromNumber: process.env.SIP_FROM_NUMBER || undefined,
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

    return {
      success: true,
      sipParticipantId: participant.sipParticipantId || participant.participantId,
      participantIdentity: participant.participantIdentity,
      sipCallId: participant.sipCallId,
    };
  } catch (error) {
    if (error instanceof TwirpError) {
      throw new Error(
        `LiveKit SIP transfer failed: ${error.message}; ` +
        `SIP status=${error.metadata?.sip_status_code || 'unknown'} ` +
        `${error.metadata?.sip_status || ''}`
      );
    }

    throw error;
  }
}

module.exports = { transferRoomToMloQueue };
```

## Example Usage

```js
const { transferRoomToMloQueue } = require('./transferRoomToMloQueue');

await transferRoomToMloQueue({
  roomName: 'active-livekit-room-name',
  userIdentity: 'customer-123',
});
```

## Important Notes

- The LiveKit room must already exist and contain the customer/user.
- This does not rely on AI decision logic. Trigger it only from the explicit transfer button or your own deterministic app action.
- If SignalWire logs show `ringing` and `answered`, the SIP path is working.
- If the call rings only once, adjust FSPBX ring group `2001` ring duration and confirm-answer settings.
