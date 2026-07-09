import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import { ts } from './latency-tracker.js';

export class LoggedElevenLabsTTS extends elevenlabs.TTS {
  override stream(options?: any) {
    const underlyingStream = super.stream(options);
    let frameCount = 0;
    const t0 = Date.now();
    console.log(`[elevenlabs-tts][${ts()}] Synthesize stream initialized (Timer started)`);

    const loggedStream = {
      label: underlyingStream.label,
      
      pushText: (text: string) => {
        console.log(`[elevenlabs-tts][${ts()}] Text pushed: "${text.trim()}"`);
        underlyingStream.pushText(text);
      },

      flush: () => {
        console.log(`[elevenlabs-tts][${ts()}] stream.flush()`);
        underlyingStream.flush();
      },

      endInput: () => {
        console.log(`[elevenlabs-tts][${ts()}] stream.endInput()`);
        underlyingStream.endInput();
      },

      close: () => {
        console.log(`[elevenlabs-tts][${ts()}] stream.close()`);
        underlyingStream.close();
      },

      updateInputStream: (stream: any) => {
        console.log(`[elevenlabs-tts][${ts()}] updateInputStream called`);
        underlyingStream.updateInputStream(stream);
      },

      get abortSignal() {
        return underlyingStream.abortSignal;
      },

      next: async () => {
        const res = await underlyingStream.next();
        if (res.done) {
          return res;
        }
        
        if (frameCount === 0) {
          const ttft = Date.now() - t0;
          console.log(`[elevenlabs-tts][${ts()}] FIRST AUDIO FRAME received from ElevenLabs (TTFT since initialization: ${ttft}ms)`);
        }
        frameCount++;
        return res;
      },

      [Symbol.asyncIterator]() {
        return this as any;
      }
    };

    return loggedStream as any;
  }
}
