import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import { ts } from './latency-tracker.js';

export class LoggedElevenLabsTTS extends elevenlabs.TTS {
  override stream(options?: any) {
    const underlyingStream = super.stream(options);
    let frameCount = 0;
    const t0 = Date.now();
    console.log(`[elevenlabs-tts][${ts()}] Synthesize stream initialized (Timer started)`);

    return new Proxy(underlyingStream, {
      get(target, prop, receiver) {
        if (prop === 'pushText') {
          return (text: string) => {
            console.log(`[elevenlabs-tts][${ts()}] Text pushed: "${text.trim()}"`);
            return target.pushText(text);
          };
        }
        if (prop === 'flush') {
          return () => {
            console.log(`[elevenlabs-tts][${ts()}] stream.flush()`);
            return target.flush();
          };
        }
        if (prop === 'endInput') {
          return () => {
            console.log(`[elevenlabs-tts][${ts()}] stream.endInput()`);
            return target.endInput();
          };
        }
        if (prop === 'close') {
          return () => {
            console.log(`[elevenlabs-tts][${ts()}] stream.close()`);
            return target.close();
          };
        }
        if (prop === 'updateInputStream') {
          return (stream: any) => {
            console.log(`[elevenlabs-tts][${ts()}] updateInputStream called`);
            return target.updateInputStream(stream);
          };
        }
        if (prop === 'next') {
          return async () => {
            const res = await target.next();
            if (res.done) {
              return res;
            }
            
            if (frameCount === 0) {
              const ttft = Date.now() - t0;
              console.log(`[elevenlabs-tts][${ts()}] FIRST AUDIO FRAME received from ElevenLabs (TTFT since initialization: ${ttft}ms)`);
            }
            frameCount++;
            return res;
          };
        }

        const val = Reflect.get(target, prop, receiver);
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return val;
      }
    }) as any;
  }
}
