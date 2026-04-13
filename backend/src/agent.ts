import { WorkerOptions, JobContext, cli } from '@livekit/agents';
import { AvatarSession } from '@livekit/agents-plugin-lemonslice';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const workerOptions: WorkerOptions = {
  agent: fileURLToPath(import.meta.url),
  workerType: 'room',
  initializeProcessTimeout: 60000,
  async entry(ctx: JobContext) {
    console.log(`[agent]: Receiving job for room: ${ctx.room.name}`);
    await ctx.connect();
    console.log(`[agent]: Connected to room: ${ctx.room.name}`);

    const dummyAgentSession = {
      output: {}
    } as any;

    const avatar = new AvatarSession({
      agentId: process.env.LEMONSLICE_AGENT_ID,
      apiKey: process.env.LEMONSLICE_API_KEY,
      idleTimeout: 3600, // Important: prevents avatar from leaving due to no audio
    });

    try {
      console.log(`[agent]: Starting LemonSlice avatar...`);
      await avatar.start(dummyAgentSession, ctx.room);
      console.log('[agent]: LemonSlice avatar started successfully!');
    } catch (error) {
      console.error('[agent]: Error starting LemonSlice avatar:', error);
    }

    console.log('[agent]: Avatar injection sequence complete!');
  },
};

export default workerOptions;

if (process.argv[1] && process.argv[1].endsWith('agent.ts')) {
   cli.runApp(workerOptions);
}
