export type TurnMetrics = {
  turnNumber: number;
  sessionAgeMs: number;
  contextItemCount: number;
  estimatedContextTokens: number;
  userTurnEndAt?: number;
  generateReplyAt?: number;
  agentSpeakingAt?: number;
  e2eLatencyMs?: number;
  ttftMs?: number;
  compactionRan?: boolean;
  rotationRan?: boolean;
};

/** Returns current UTC time formatted as HH:MM:SS.mmm for log readability */
export function ts(): string {
  return new Date().toISOString().slice(11, 23);
}

export class LatencyTracker {
  private sessionStartAt = Date.now();
  private turnNumber = 0;
  private pendingUserTurnEnd?: number;
  private pendingGenerateReply?: number;

  // Per-turn pipeline stage timestamps
  private t_stt_start: number | undefined;
  private t_stt_complete: number | undefined;
  private t_llm_start: number | undefined;
  private t_llm_first_token: number | undefined;
  private t_llm_complete: number | undefined;
  private t_tts_start: number | undefined;
  private t_tts_complete: number | undefined;

  startTurn(): number {
    this.turnNumber += 1;
    // Cancel any pending avatar-frame fallback timeout from the previous turn
    if (this._avatarFrameTimeoutHandle) {
      clearTimeout(this._avatarFrameTimeoutHandle);
      this._avatarFrameTimeoutHandle = undefined;
    }
    // Reset pipeline timestamps for new turn
    this.t_stt_start = undefined;
    this.t_stt_complete = undefined;
    this.t_llm_start = undefined;
    this.t_llm_first_token = undefined;
    this.t_llm_complete = undefined;
    this.t_tts_start = undefined;
    this.t_tts_complete = undefined;
    this.t_avatar_render_start = undefined;
    this.t_avatar_first_frame = undefined;
    return this.turnNumber;
  }

  markUserTurnEnd(): void {
    this.pendingUserTurnEnd = Date.now();
  }

  markGenerateReply(): void {
    this.pendingGenerateReply = Date.now();
  }

  markSttStart(): void { this.t_stt_start = Date.now(); }
  markSttComplete(transcript: string): void {
    this.t_stt_complete = Date.now();
    const dur = this.t_stt_start ? this.t_stt_complete - this.t_stt_start : -1;
    console.log(`[pipeline][${ts()}] STT complete (${dur}ms): "${transcript}"`);
  }

  markLlmStart(): void {
    this.t_llm_start = Date.now();
    console.log(`[pipeline][${ts()}] LLM request sent → Cerebras`);
  }

  markLlmFirstToken(): void {
    if (this.t_llm_first_token) return; // only record first
    this.t_llm_first_token = Date.now();
    const ttft = this.t_llm_start ? this.t_llm_first_token - this.t_llm_start : -1;
    console.log(`[pipeline][${ts()}] LLM first token received  TTFT=${ttft}ms${ttft > 60000 ? '  ⚠️  INFRA ISSUE (>60s)' : ttft > 5000 ? '  ⚠️  HIGH' : '  ✓'}`);
  }

  markLlmComplete(): void {
    this.t_llm_complete = Date.now();
    const dur = this.t_llm_start ? this.t_llm_complete - this.t_llm_start : -1;
    console.log(`[pipeline][${ts()}] LLM stream complete  total=${dur}ms`);
  }

  markTtsStart(): void {
    this.t_tts_start = Date.now();
    const lag = this.t_llm_first_token ? this.t_tts_start - this.t_llm_first_token : -1;
    console.log(`[pipeline][${ts()}] TTS started  lag_after_first_token=${lag}ms`);
  }

  markTtsComplete(): void {
    this.t_tts_complete = Date.now();
    const dur = this.t_tts_start ? this.t_tts_complete - this.t_tts_start : -1;
    console.log(`[pipeline][${ts()}] TTS audio complete  render_dur=${dur}ms`);
    this.logPipelineReport();
  }

  // ── Avatar rendering latency (LemonSlice) ──────────────────────────────
  private t_avatar_render_start: number | undefined;
  private t_avatar_first_frame: number | undefined;
  private _avatarFrameTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

  /** Called when TTS starts (ttsNode) AND again when agent state → speaking.
   *  First call (ttsNode) arms the 1500ms safety-net timeout early, so it fires
   *  even on race-condition turns where the 'speaking' state is never reached.
   *  Second call (speaking state) refreshes the timestamp for accurate lag logging
   *  and resets the timeout with the more precise start time.
   */
  markAvatarRenderStart(): void {
    const isFirstCall = !this.t_avatar_render_start;
    this.t_avatar_render_start = Date.now();
    const renderStartSnapshot = this.t_avatar_render_start;
    const lag = this.t_tts_start ? this.t_avatar_render_start - this.t_tts_start : -1;
    if (isFirstCall) {
      // Only log on the first call (from ttsNode) to avoid duplicate lines
      console.log(`[pipeline][${ts()}] AVATAR render start  lag_after_tts_start=${lag}ms`);
    }

    // ── Per-turn race-condition safety net ───────────────────────────────────
    // The ActiveSpeakersChanged event sometimes fires AFTER the LiveKit SDK has
    // cleaned up the TTS task (the "firstFrameFut cancelled" bug). When that
    // happens, markAvatarFirstFrame() is never called and tts_to_avatar_ms
    // stays at -1 forever. This timeout fires after 1500ms as a guaranteed
    // fallback, preventing -1 metrics and broken state on any turn.
    // Calling from ttsNode (first) ensures the timeout is armed BEFORE the
    // SDK's firstFrameFut lifecycle can race and cancel — even if the 'speaking'
    // state never fires.
    if (this._avatarFrameTimeoutHandle) {
      clearTimeout(this._avatarFrameTimeoutHandle);
    }
    this._avatarFrameTimeoutHandle = setTimeout(() => {
      this._avatarFrameTimeoutHandle = undefined;
      // Only fire if this is still the same turn (render start hasn't been reset)
      if (this.t_avatar_render_start === renderStartSnapshot && !this.t_avatar_first_frame) {
        console.warn(`[pipeline][${ts()}] ⚠️  Avatar first-frame timeout — ActiveSpeakersChanged never fired. Firing [TIMEOUT_FALLBACK] estimate. This is a LiveKit SDK event-drop, NOT real avatar lag.`);
        this.markAvatarFirstFrame(true /* isFallback */);
      }
    }, 1500);
  }


  /** Called when the LiveKit agent-speaking event fires — avatar first audio frame is live.
   * @param isFallback  Set to true when called from the 1500ms safety-net timeout instead
   *                    of the real ActiveSpeakersChanged event. Fallback entries are flagged
   *                    in logs so they can be excluded from latency analytics.
   */
  markAvatarFirstFrame(isFallback = false): void {
    if (this.t_avatar_first_frame) return; // only record once per turn
    if (!this.t_avatar_render_start) return; // guard: only valid after markAvatarRenderStart()
    this.t_avatar_first_frame = Date.now();
    const sinceRenderStart = this.t_avatar_first_frame - this.t_avatar_render_start;
    const sinceTtsStart = this.t_tts_start ? this.t_avatar_first_frame - this.t_tts_start : -1;
    const sinceUserTurn = this.pendingUserTurnEnd ? this.t_avatar_first_frame - this.pendingUserTurnEnd : -1;
    console.log(JSON.stringify({
      type: 'ailana-metrics',
      event: 'avatar_first_frame',
      tts_to_avatar_ms: sinceRenderStart,
      tts_start_to_avatar_ms: sinceTtsStart,
      e2e_to_avatar_ms: sinceUserTurn,
      isFallback,
      turnNumber: this.turnNumber,
      sessionAgeMs: Date.now() - this.sessionStartAt,
    }));
    const fallbackTag = isFallback ? ' [TIMEOUT_FALLBACK — LiveKit event drop, not real lag]' : '';
    console.log(
      `[pipeline][${ts()}] ── AVATAR LATENCY ──` +
      `  tts_to_avatar=${sinceRenderStart}ms` +
      `  tts_start_to_avatar=${sinceTtsStart}ms` +
      `  e2e_user_to_avatar=${sinceUserTurn}ms` +
      fallbackTag
    );
  }

  markAgentSpeaking(): void {
    if (!this.pendingUserTurnEnd) return;
    const now = Date.now();
    const e2e = now - this.pendingUserTurnEnd;
    this.logTurn({
      e2eLatencyMs: e2e,
      agentSpeakingAt: now,
    });
  }

  recordRealtimeMetrics(ttftMs: number, inputTokens: number): void {
    // Only log if ttftMs is meaningful (not -1 placeholder)
    if (ttftMs >= 0 && !this.t_llm_first_token) {
      this.t_llm_first_token = Date.now();
      console.log(`[pipeline][${ts()}] LLM TTFT (from SDK metrics): ${ttftMs}ms${ttftMs > 60000 ? '  ⚠️  INFRA ISSUE (>60s)' : ttftMs > 5000 ? '  ⚠️  HIGH' : '  ✓'}`);
    }
    this.logTurn({ ttftMs, estimatedContextTokens: inputTokens });
  }

  logCompaction(itemsBefore: number, itemsAfter: number): void {
    console.log(JSON.stringify({
      type: 'ailana-metrics', event: 'context_compaction',
      itemsBefore, itemsAfter,
      turnNumber: this.turnNumber,
      sessionAgeMs: Date.now() - this.sessionStartAt,
    }));
  }

  logRotation(reason: string): void {
    console.log(JSON.stringify({
      type: 'ailana-metrics', event: 'session_rotation',
      reason, turnNumber: this.turnNumber,
      sessionAgeMs: Date.now() - this.sessionStartAt,
    }));
  }

  /** Prints a human-readable single-line timing summary after each full turn. */
  private logPipelineReport(): void {
    const ref = this.t_stt_start ?? this.pendingUserTurnEnd;
    if (!ref) return;
    const fmt = (t?: number) => t ? `${t - ref}ms` : '?';
    console.log(
      `[pipeline][${ts()}] ── TURN ${this.turnNumber} SUMMARY ──` +
      `  stt_done=${fmt(this.t_stt_complete)}` +
      `  llm_start=${fmt(this.t_llm_start)}` +
      `  llm_first_token=${fmt(this.t_llm_first_token)}` +
      `  llm_done=${fmt(this.t_llm_complete)}` +
      `  tts_start=${fmt(this.t_tts_start)}` +
      `  tts_done=${fmt(this.t_tts_complete)}`
    );
  }

  private logTurn(extra: Partial<TurnMetrics>): void {
    const payload: TurnMetrics = {
      turnNumber: this.turnNumber,
      sessionAgeMs: Date.now() - this.sessionStartAt,
      contextItemCount: extra.contextItemCount ?? 0,
      estimatedContextTokens: extra.estimatedContextTokens ?? 0,
      ...extra,
    };
    if (this.pendingUserTurnEnd) payload.userTurnEndAt = this.pendingUserTurnEnd;
    if (this.pendingGenerateReply) payload.generateReplyAt = this.pendingGenerateReply;
    console.log(JSON.stringify({ type: 'ailana-metrics', event: 'turn', ...payload }));
  }

  logContextSize(itemCount: number, estimatedTokens: number): void {
    this.logTurn({ contextItemCount: itemCount, estimatedContextTokens: estimatedTokens });
  }
}
