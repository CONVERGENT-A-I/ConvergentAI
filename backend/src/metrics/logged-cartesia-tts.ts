import * as cartesia from '@livekit/agents-plugin-cartesia';
import { ts } from './latency-tracker.js';

export class LoggedCartesiaTTS extends cartesia.TTS {
  override stream(options?: any) {
    const underlyingStream = super.stream(options);
    let frameCount = 0;
    const t0 = Date.now();
    console.log(`[cartesia-tts][${ts()}] Synthesize stream initialized (Timer started)`);

    return new Proxy(underlyingStream, {
      get(target, prop, receiver) {
        if (prop === 'pushText') {
          return (text: string) => {
            console.log(`[cartesia-tts][${ts()}] Text pushed: "${text.trim()}"`);
            return target.pushText(text);
          };
        }
        if (prop === 'flush') {
          return () => {
            console.log(`[cartesia-tts][${ts()}] stream.flush()`);
            return target.flush();
          };
        }
        if (prop === 'endInput') {
          return () => {
            console.log(`[cartesia-tts][${ts()}] stream.endInput()`);
            return target.endInput();
          };
        }
        if (prop === 'close') {
          return () => {
            console.log(`[cartesia-tts][${ts()}] stream.close()`);
            return target.close();
          };
        }
        if (prop === 'updateInputStream') {
          return (stream: any) => {
            console.log(`[cartesia-tts][${ts()}] updateInputStream called`);
            return target.updateInputStream(stream);
          };
        }
        if (prop === 'next') {
          return async () => {
            const res = await target.next();
            if (res.done) {
              return res;
            }
            
            const event = res.value;
            if (event && typeof event === 'object' && 'frame' in event) {
              if (frameCount < 5) {
                console.log(`[cartesia-tts-debug] Frame ${frameCount}: sampleRate=${event.frame.sampleRate}, channels=${event.frame.channels}, samples=${event.frame.samplesPerChannel}, bytes=${event.frame.data.length}`);
              }
            }

            if (frameCount === 0) {
              const ttft = Date.now() - t0;
              console.log(`[cartesia-tts][${ts()}] FIRST AUDIO FRAME received from Cartesia (TTFT since initialization: ${ttft}ms)`);
            }
            frameCount++;
            return res;
          };
        }

        if (prop === Symbol.asyncIterator) {
          return () => receiver;
        }

        // Transparently forward all other properties/methods (maintains prototype chain and internal states)
        const val = Reflect.get(target, prop, receiver);
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return val;
      }
    }) as any;
  }
}
