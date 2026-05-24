Please have the developers update the SignalWire Setup and FSPBX Setup sections of the documentation with these real-world architectural values:
1. SignalWire Space Target Mapping
Our SignalWire space uses a standard SIP Endpoint registration format, not an isolated SWML subdomain.

Incorrect Documentation Value: convergentai-livekit-mlo-queue.dapp.signalwire.com
Correct Production Value: convergentai-33de6d391dc2.sip.signalwire.com
2. Destination Extension Number
The MLO Queue is mapped to extension 9400 on our PBX, not 2001.

Incorrect Documentation Value: 2001
Correct Production Value: 9400
3. Connection Method
SignalWire is configured to handle this leg via Passthrough (Block PSTN) to natively route SIP-to-SIP traffic. Developers do not need to maintain or execute a standalone .swml script block for this transfer path.

:computer: Section 2: Updated Environment Configuration
Developers should swap out the placeholder environment variables in the .env setup file for these verified variables:
Code snippet



LIVEKIT_URL=
wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# The verified Trunk ID generated in your LiveKit dashboard
SIP_TRUNK_SID=ST_JA7tUGjFUZ9K

# The destination user extension on the targeted PBX
SIP_CALL_TO=9400

# The verified identity number registered on SignalWire
SIP_FROM_NUMBER=+12017404497
SIP_PARTICIPANT_NAME=MLO Queue
SIP_WAIT_UNTIL_ANSWERED=true
SIP_RINGING_TIMEOUT_SECONDS=45

:rocket: Section 3: Clean Node.js Code Adjustments
Have the developers replace the metadata headers block inside the transferRoomToMloQueue function to reflect the corrected target extension metadata.
Here is the clean snippet for the sipClient.createSipParticipant options payload:
JavaScript



const participant = await sipClient.createSipParticipant(
  requiredEnv('SIP_TRUNK_SID'),
  requiredEnv('SIP_CALL_TO'), // Will cleanly evaluate to '9400'
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
      'X-Queue-Extension': '9400', // Updated from 2001 to 9400
    },
  }
);David  [2:46 AM]
most of the entries are not not needed because we are not using swml or pstn. I will attempt to provide you with something cleaner.
David  [2:59 AM]
Here you go:LiveKit Transfer to Queue.txt 

Here is the fully updated, clean production documentation and script. The caller identity number has been updated to **`+14238931776`** to match your active Chattanooga number on the [Purchased Phone Numbers](https://convergentai.signalwire.com/phone_numbers) dashboard.

---

# FS PBX & LiveKit SIP-to-SIP Transfer Handoff

This document details the configuration for transferring an active LiveKit room call directly to the **FS PBX** MLO Sales Queue over a strict SIP-to-SIP path via SignalWire. This path bypasses the PSTN entirely.

## 1. Network Topology

```text
LiveKit Agent/Backend
  └── LiveKit Outbound SIP Trunk
       └── SignalWire Proxy (Passthrough Mode)
            └── FS PBX Domain (fspbx.convergentai.tech:7000)
                 └── MLO Sales Queue (Extension 9400)

```

---

## 2. Infrastructure Configuration

### LiveKit Trunk Settings

Create or update your outbound SIP trunk inside your LiveKit dashboard using these exact parameters:

* **Trunk Name:** SignalWire MLO Queue Trunk
* **Trunk ID:** `ST_JA7tUGjFUZ9K`
* **Address:** `convergentai-33de6d391dc2.sip.signalwire.com`
* **Numbers:** `["+14238931776"]`
* **Transport:** `SIP_TRANSPORT_UDP` (3)

### SignalWire Endpoint Settings

To facilitate direct SIP-to-SIP proxying without script overhead, configure your **livekit-mlo** credential resource inside the SignalWire dashboard as follows:

* **Call Handler:** `Passthrough`
* **PSTN Policy:** `Block PSTN` (Enforces strict SIP-to-SIP isolation for security)

### FS PBX Settings

Verify these target metrics on your active [Basic Queues](https://fspbx.convergentai.tech/basic-queues) dashboard:

* **SIP Domain:** `fspbx.convergentai.tech`
* **SIP Port:** `7000`
* **Transport:** `UDP`
* **Target Queue Extension:** `9400` (MLO Sales Queue)

---

## 3. Deployment Environment Variables

Store these values in your backend application context (`.env`):

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# Telephony Routing
SIP_TRUNK_SID=ST_JA7tUGjFUZ9K
SIP_CALL_TO=9400
SIP_FROM_NUMBER=+14238931776

```

---

## 4. Production Node.js Transfer Script

This clean, production-ready script strips out all external webhooks and custom headers, executing a native SIP-to-SIP handoff block.

```js
'use strict';

const { SipClient } = require('livekit-server-sdk');

/**
 * Triggers a direct SIP-to-SIP transfer leg from an active LiveKit room 
 * into the SignalWire gateway domain mapped to FS PBX.
 * * @param {Object} params
 * @param {string} params.roomName - The active LiveKit room name containing the user
 */
async function transferRoomToMloQueue({ roomName }) {
  if (!roomName) {
    throw new Error('roomName is required to execute a transfer');
  }

  // Normalize host format for the LiveKit SipClient constructor
  const livekitHost = process.env.LIVEKIT_URL.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');

  const sipClient = new SipClient(
    livekitHost,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );

  try {
    const participant = await sipClient.createSipParticipant(
      process.env.SIP_TRUNK_SID,  // ST_JA7tUGjFUZ9K
      process.env.SIP_CALL_TO,    // 9400
      roomName,
      {
        participantIdentity: `mlo-queue-${Date.now()}`,
        fromNumber: process.env.SIP_FROM_NUMBER || undefined, // Sends +14238931776 as Outbound Caller ID Identity
        playDialtone: true,
        waitUntilAnswered: true
      }
    );

    return {
      success: true,
      sipParticipantId: participant.sipParticipantId || participant.participantId,
      sipCallId: participant.sipCallId
    };
  } catch (error) {
    throw new Error(`LiveKit to SignalWire SIP Handshake Failed: ${error.message}`);
  }
}

module.exports = { transferRoomToMloQueue };

```

---

## 5. Execution Verification

When developers trigger this code, you can monitor your active session logs to verify traffic. A successful handshake path will show the inbound leg from LiveKit hitting the endpoint using `+14238931776` as the mask identity, and cleanly creating an outbound bridge leg straight to `sip:9400@fspbx.convergentai.tech:7000`.