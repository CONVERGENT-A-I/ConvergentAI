import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AccessToken } from 'livekit-server-sdk';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/api/test', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Backend connection established!',
    timestamp: new Date().toISOString(),
    env_verified: !!process.env.NODE_ENV
  });
});

// LiveKit Token Generation Endpoint
app.post('/api/get-token', async (req: Request, res: Response) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      res.status(400).json({ error: 'roomName and participantName are required' });
      return;
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      res.status(500).json({ error: 'LiveKit server side configuration missing' });
      return;
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    // --- KEYFRAME LABS INTEGRATION ---
    let keyframeMetadata = null;
    const keyframeApiKey = process.env.KEYFRAME_API_KEY;
    const personaSlug = process.env.KEYFRAME_PERSONA_SLUG;

    if (keyframeApiKey && personaSlug) {
      try {
        console.log(`[server]: Requesting Keyframe session for persona: ${personaSlug}`);
        const kfRes = await fetch("https://api.keyframelabs.com/v1/sessions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${keyframeApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            persona_slug: personaSlug,
            //emotion: "happy" // Set default mood to smile
          }),
        });

        if (kfRes.ok) {
          const raw = await kfRes.json();
          console.log(`[server]: Keyframe raw response:`, JSON.stringify(raw, null, 2));

          // Normalize: API may return flat { server_url, participant_token, agent_identity }
          // OR nested { session_details: { server_url, ... }, voice_agent_details: { ... } }
          if (raw.session_details) {
            keyframeMetadata = {
              server_url: raw.session_details.server_url,
              participant_token: raw.session_details.participant_token,
              agent_identity: raw.session_details.agent_identity,
            };
          } else {
            keyframeMetadata = {
              server_url: raw.server_url,
              participant_token: raw.participant_token,
              agent_identity: raw.agent_identity,
            };
          }
          console.log(`[server]: Keyframe session normalized →`, keyframeMetadata);
        } else {
          const errorBody = await kfRes.text();
          console.error(`[server]: Keyframe API Error (${kfRes.status}):`, errorBody);
        }
      } catch (error) {
        console.error('[server]: Failed to fetch Keyframe session:', error);
      }
    }
    // ---------------------------------

    res.json({
      token,
      serverUrl: wsUrl,
      keyframe: keyframeMetadata
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(PORT, async () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  console.log(`[server]: Environment: ${process.env.NODE_ENV}`);
  if (!!process.env.LIVEKIT_API_KEY) {
    console.log('[server]: LiveKit API Key is configured.');
  } else {
    console.warn('[server]: Warning: LIVEKIT_API_KEY is not defined in .env');
  }

  // Start the Agent worker
  try {
    const { fork } = await import('child_process');
    const { fileURLToPath } = await import('url');
    const path = await import('path');

    // Resolve path cleanly using import.meta.url
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const agentFilePath = path.join(__dirname, 'agent.ts');

    const agentProcess = fork(agentFilePath, ['dev'], {
      execArgv: ['--import', 'tsx'],
      env: process.env,
      stdio: 'inherit'
    });

    agentProcess.on('error', (err) => {
      console.error(`[server]: Failed to start Agent Worker:`, err);
    });
  } catch (error) {
    console.error(`[server]: Agent Worker initialization error:`, error);
  }
});
