if (process.platform === 'win32') {
  const psPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0';
  if (process.env.PATH && !process.env.PATH.includes(psPath)) {
    process.env.PATH = `${psPath};${process.env.PATH}`;
  }
}

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

    res.json({
      token,
      serverUrl: wsUrl,
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Legacy telemetry endpoint — kept for any remaining frontend instrumentation
app.post('/api/log-telemetry', (req: Request, res: Response) => {
  try {
    const { event, durationMs, details } = req.body;
    console.log(`[client-telemetry] event=${event} duration=${durationMs}ms details=${JSON.stringify(details || {})}`);
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write telemetry' });
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

    // In production (running compiled dist/index.js), fork the compiled agent.js.
    // In development (running src/index.ts via tsx), fork agent.ts with tsx.
    const isCompiledDist = __filename.endsWith('.js');
    const agentFilePath = isCompiledDist
      ? path.join(__dirname, 'agent.js')   // production: run compiled JS
      : path.join(__dirname, 'agent.ts');  // development: run TS via tsx

    // Pass DATABASE_URL explicitly to forked process
    const forkEnv = {
      ...process.env,
      LIVEKIT_LOG_LEVEL: 'info',
      DATABASE_URL: process.env.DATABASE_URL, // Explicitly pass DATABASE_URL
    };

    const forkOptions = isCompiledDist
      ? { env: forkEnv, stdio: 'inherit' as const }
      : { execArgv: ['--import', 'tsx'], env: forkEnv, stdio: 'inherit' as const };

    console.log(`[server]: Starting Agent Worker — ${isCompiledDist ? 'production (compiled JS)' : 'development (tsx TS)'}`);
    console.log(`[server]: Agent worker file: ${agentFilePath}`);
    console.log(`[server]: DATABASE_URL passed to agent: ${process.env.DATABASE_URL ? '✅ YES' : '❌ NO'}`);

    const agentProcess = fork(agentFilePath, ['dev'], forkOptions);

    agentProcess.on('error', (err) => {
      console.error(`[server]: Failed to start Agent Worker:`, err);
    });
  } catch (error) {
    console.error(`[server]: Agent Worker initialization error:`, error);
  }
});
