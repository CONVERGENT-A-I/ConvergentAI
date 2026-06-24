export class BackchannelEngine {
  private lastBackchannelTime: number = 0;
  private readonly COOLDOWN_MS = 10000; // 10 seconds between backchannels
  private readonly MIN_WORDS = 15;
  private readonly affirmations = ['Mhm.', 'Yeah.', 'I see.', 'Right.', 'Uh-huh.'];

  /**
   * Evaluates an interim transcript and triggers a backchannel if appropriate.
   */
  public onInterimTranscript(transcript: string, session: any) {
    const now = Date.now();
    
    // Prevent backchanneling if we recently backchanneled
    if (now - this.lastBackchannelTime < this.COOLDOWN_MS) {
      return;
    }

    const words = transcript.trim().split(/\s+/);
    
    // Require at least a certain number of words in the current turn
    if (words.length < this.MIN_WORDS) {
      return;
    }

    this.lastBackchannelTime = now;
    
    // Pick a random soft affirmation
    const affirmation = this.affirmations[Math.floor(Math.random() * this.affirmations.length)];
    console.log(`[BackchannelEngine]: Injecting soft backchannel "${affirmation}"`);

    try {
      // Inject speech without adding it to the LLM chat context so it doesn't pollute the prompt.
      // allowInterruptions: false ensures the agent doesn't stop generating if it was already speaking, 
      // but in this case, the user is speaking, so it's a parallel injection.
      session.say(affirmation, { 
        allowInterruptions: false, 
        addToChatCtx: false 
      });
    } catch (e) {
      console.error('[BackchannelEngine]: Failed to inject backchannel:', e);
    }
  }

  /**
   * Reset cooldowns when a new turn starts or the agent finishes speaking
   */
  public reset() {
    this.lastBackchannelTime = Date.now(); // Reset to now so it doesn't immediately backchannel on the next user turn
  }
}
