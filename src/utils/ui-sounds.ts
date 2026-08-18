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
    
    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.4; // Soft volume for background
    masterGain.connect(ctx.destination);

    // C Major Pentatonic scale (very relaxing, spa-like feel)
    const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; 

    let intervalId: NodeJS.Timeout;
    const activeOscillators = new Set<OscillatorNode>();

    const playAmbientNote = () => {
      if (ctx.state === 'closed') return;
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
      
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      // Extremely gentle envelope (like wind chimes or soft synth pad)
      const t = ctx.currentTime;
      noteGain.gain.setValueAtTime(0, t);
      noteGain.gain.linearRampToValueAtTime(0.08, t + 1.5); // Slow 1.5s fade in
      noteGain.gain.exponentialRampToValueAtTime(0.001, t + 5.0); // 3.5s long ringing fade out
      
      osc.connect(noteGain);
      noteGain.connect(masterGain);
      
      osc.start(t);
      osc.stop(t + 5.0);
      
      activeOscillators.add(osc);
      osc.onended = () => {
        activeOscillators.delete(osc);
      };
    };

    // Initial chord swell: play 3 random notes in sequence
    playAmbientNote();
    setTimeout(playAmbientNote, 400);
    setTimeout(playAmbientNote, 900);

    // Continue generating new relaxing notes every 1.2 seconds
    intervalId = setInterval(() => {
      playAmbientNote();
    }, 1200);

    // Fallback stop
    const fallbackTimeout = setTimeout(() => {
      if (ctx.state !== 'closed') {
        masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
        setTimeout(() => ctx.close().catch(() => {}), 2500);
      }
    }, 45000); // Allow up to 45 seconds of hold music

    // Save the stop function globally
    globalStopSound = () => {
      clearTimeout(fallbackTimeout);
      clearInterval(intervalId);
      if (ctx.state !== 'closed') {
        const stopTime = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(stopTime);
        masterGain.gain.setValueAtTime(masterGain.gain.value || 0.4, stopTime);
        masterGain.gain.linearRampToValueAtTime(0.001, stopTime + 1.0); // Smooth 1-second fade out when agent connects
        
        setTimeout(() => {
          activeOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
          });
          activeOscillators.clear();
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

