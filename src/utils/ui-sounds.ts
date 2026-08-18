let globalStopSound: (() => void) | null = null;

export function playConnectingSound() {
  if (typeof window === 'undefined') return;
  
  if (globalStopSound) {
    globalStopSound();
    globalStopSound = null;
  }
  
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Master gain with a slow, soothing envelope
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.12, now + 1.5); // 1.5 second slow fade in
    masterGain.connect(ctx.destination);

    // Create a soothing Fmaj7 ambient chord (F4, A4, C5, E5)
    const frequencies = [349.23, 440.00, 523.25, 659.25];
    const oscillators: OscillatorNode[] = [];

    frequencies.forEach((freq) => {
      // Main pure tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      // Individual gain for slight detune/chorus balancing
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.25; 
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      
      osc.start(now);
      oscillators.push(osc);
      
      // Add a very subtle detuned layer for each note to create a warm "shimmer"
      const detunedOsc = ctx.createOscillator();
      detunedOsc.type = 'sine';
      detunedOsc.frequency.value = freq + (Math.random() * 2 - 1); // detune by +/- 1 Hz
      
      const detunedGain = ctx.createGain();
      detunedGain.gain.value = 0.1; 
      
      detunedOsc.connect(detunedGain);
      detunedGain.connect(masterGain);
      
      detunedOsc.start(now);
      oscillators.push(detunedOsc);
    });
    
    // Fallback: stop after 30 seconds anyway to prevent infinite drones if something hangs
    const fallbackTimeout = setTimeout(() => {
      if (ctx.state !== 'closed') {
        masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
        setTimeout(() => ctx.close().catch(() => {}), 2000);
      }
    }, 30000);

    // Save the stop function globally
    globalStopSound = () => {
      clearTimeout(fallbackTimeout);
      if (ctx.state !== 'closed') {
        const stopTime = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(stopTime);
        masterGain.gain.setValueAtTime(masterGain.gain.value || 0.12, stopTime);
        masterGain.gain.exponentialRampToValueAtTime(0.001, stopTime + 1.0); // 1 second gentle fade out
        
        setTimeout(() => {
          oscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
          });
          ctx.close().catch(() => {});
        }, 1100);
      }
    };
  } catch (error) {
    console.warn("AudioContext failed to play connecting sound", error);
  }
}

export function stopConnectingSound() {
  if (globalStopSound) {
    globalStopSound();
    globalStopSound = null;
  }
}

