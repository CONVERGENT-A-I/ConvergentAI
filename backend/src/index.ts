import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  console.log(`[server]: Environment: ${process.env.NODE_ENV}`);
  if (!!process.env.LIVEKIT_API_KEY) {
    console.log('[server]: LiveKit API Key is configured.');
  } else {
    console.warn('[server]: Warning: LIVEKIT_API_KEY is not defined in .env');
  }
});
