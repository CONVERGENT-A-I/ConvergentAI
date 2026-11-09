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
import loanOfficerRoutes from './routes/loan-officer.js';
import schedulingRoutes from './routes/scheduling.js';
import { isEslConfigured } from './services/freeswitch-esl.js';
import { isGoogleCalendarConfigured } from './services/google-calendar.js';
import { allowRequest, requestKey, safeErrorMessage, safeTelemetryDetails } from './utils/security.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]{3,80}$/;

// Middleware
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
    'Cache-Control': 'no-store',
  });
  next();
});
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '32kb', strict: true }));

// --- Loan Officer Call Bridge: zip routing + SIP dialing + pre-call alerts ---
app.use('/api', loanOfficerRoutes);
app.use('/api', schedulingRoutes);

// Service status (does not clash with the plain /health check below)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      livekit: !!process.env.LIVEKIT_API_KEY,
      fspbx: !!process.env.FSPBX_DB_HOST,
      ringotel: Boolean(process.env.RINGOTEL_API_URL && process.env.RINGOTEL_AUTH_TOKEN && process.env.RINGOTEL_ORG_ID),
      freeswitchEsl: isEslConfigured(),
      googleCalendar: isGoogleCalendarConfigured(),
    },
  });
});
// -------------------------------------------------------------------------

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
    if (!allowRequest(requestKey(req, 'livekit-token'), 12)) {
      res.status(429).json({ error: 'Too many token requests' });
      return;
    }
    const { roomName, participantName } = req.body;

    if (typeof roomName !== 'string' || typeof participantName !== 'string' ||
        !IDENTIFIER_PATTERN.test(roomName) || !IDENTIFIER_PATTERN.test(participantName)) {
      res.status(400).json({ error: 'Invalid room or participant name' });
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
      ttl: process.env.LIVEKIT_TOKEN_TTL || '10m',
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
      // Section 0 first screen (S0-25): only sent with the flag on, so the flag-off app is unchanged.
      // Lender details are runtime settings in backend/.env (no frontend rebuild needed).
      ...(process.env.SECTION_0_ENABLED === 'true'
        ? {
            section0: {
              enabled: true,
              lender: {
                name: process.env.LENDER_NAME || null,
                nmls: process.env.LENDER_NMLS || null,
                phone: process.env.LENDER_PHONE || null,
                branchUrl: process.env.LENDER_BRANCH_URL || null,
                hours: process.env.LENDER_HOURS || null,
              },
            },
          }
        : {}),
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', safeErrorMessage(error));
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Section 0 (S0-26): a channel-card tap = AI-engagement + recording consent. Logged always; stored when the DB is ready.
app.post('/api/consent', async (req: Request, res: Response) => {
  if (process.env.SECTION_0_ENABLED !== 'true') {
    res.status(404).json({ error: 'not enabled' });
    return;
  }
  try {
    const { recordChannelConsents } = await import('./services/consent-service.js');
    const { roomName, channel } = req.body ?? {};
    const result = await recordChannelConsents({
      roomName: String(roomName ?? ''),
      channel: String(channel ?? ''),
      ipAddress: (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') ?? undefined,
    });
    if (!result.ok) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    console.error('[consent] failed:', err);
    res.status(500).json({ error: 'Failed to record consent' });
  }
});

// Legacy telemetry endpoint — kept for any remaining frontend instrumentation
app.post('/api/log-telemetry', (req: Request, res: Response) => {
  try {
    if (!allowRequest(requestKey(req, 'telemetry'), 60)) {
      res.status(429).json({ error: 'Too many telemetry requests' });
      return;
    }
    const { event, durationMs, details } = req.body;
    const safeEvent = typeof event === 'string' && /^[A-Za-z0-9_.:-]{1,80}$/.test(event) ? event : 'invalid_event';
    const safeDuration = Number.isFinite(Number(durationMs)) ? Math.max(0, Math.min(Number(durationMs), 600_000)) : 0;
    console.log(`[client-telemetry] event=${safeEvent} duration=${safeDuration}ms details=${JSON.stringify(safeTelemetryDetails(details))}`);
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
      console.error(`[server]: Failed to start Agent Worker:`, safeErrorMessage(err));
    });
  } catch (error) {
    console.error(`[server]: Agent Worker initialization error:`, safeErrorMessage(error));
  }
});
