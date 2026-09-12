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
  public t_stt_duration_ms: number | undefined; // persisted before startTurn() wipes t_stt_start
  private t_llm_start: number | undefined;
  private t_llm_first_token: number | undefined;
  private t_llm_complete: number | undefined;
  private t_tts_start: number | undefined;
  private t_tts_first_byte: number | undefined;
  private t_tts_complete: number | undefined;

  startTurn(): number {
    this.turnNumber += 1;
    // Cancel any pending avatar-frame fallback timeout from the previous turn
    if (this._avatarFrameTimeoutHandle) {
      clearTimeout(this._avatarFrameTimeoutHandle);
      this._avatarFrameTimeoutHandle = undefined;
    }
    // Reset pipeline timestamps for new turn
    // NOTE: t_stt_duration_ms is intentionally NOT cleared here.
    // markSttComplete() sets it just before startTurn() is called (in the
    // UserInputTranscribed handler). Clearing it here would wipe the value
    // before logPipelineReport() can use it. It is overwritten naturally
    // on the next markSttComplete() call.
    this.t_stt_start = undefined;
    this.t_stt_complete = undefined;
    this.t_llm_start = undefined;
    this.t_llm_first_token = undefined;
    this.t_llm_complete = undefined;
    this.t_tts_start = undefined;
    this.t_tts_first_byte = undefined;
    this.t_tts_complete = undefined;
    this.t_avatar_render_start = undefined;
    this.t_avatar_first_frame = undefined;
    this.t_client_render_ms = undefined;
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
    // ── Persist the computed duration so it survives startTurn() resetting t_stt_start ──
    // inference.STT fires UserInputTranscribed which calls markSttComplete() then startTurn().
    // startTurn() clears t_stt_start, leaving stt_done=? in the pipeline report.
    // Storing the duration here means logPipelineReport() can always show it.
    this.t_stt_duration_ms = dur >= 0 ? dur : undefined;
    console.log(`[pipeline][${ts()}] STT complete (${dur >= 0 ? dur + 'ms' : '?'}): "${transcript}"`);
  }

  markLlmStart(): void {
    if (this.t_llm_start) return;
    this.t_llm_start = Date.now();
  }

  markLlmFirstToken(ttftMs?: number): void {
    if (this.t_llm_first_token) return; // only record first
    if (ttftMs !== undefined && ttftMs >= 0 && this.t_llm_start) {
      this.t_llm_first_token = this.t_llm_start + ttftMs;
    } else if (ttftMs !== undefined && ttftMs >= 0 && !this.t_llm_start) {
      this.t_llm_start = Date.now() - ttftMs;
      this.t_llm_first_token = Date.now();
    } else {
      this.t_llm_first_token = Date.now();
    }
  }

  markLlmComplete(): void {
    this.t_llm_complete = Date.now();
  }

  markTtsStart(): void {
    if (this.t_tts_start) return;
    this.t_tts_start = Date.now();
  }

  markTtsFirstByte(ttfbMs?: number): void {
    if (this.t_tts_first_byte) return;
    if (ttfbMs !== undefined && ttfbMs >= 0 && this.t_tts_start) {
      this.t_tts_first_byte = this.t_tts_start + ttfbMs;
    } else if (ttfbMs !== undefined && ttfbMs >= 0 && !this.t_tts_start) {
      this.t_tts_start = Date.now() - ttfbMs;
      this.t_tts_first_byte = Date.now();
    } else {
      this.t_tts_first_byte = Date.now();
    }
  }

  markTtsComplete(ttfbMs?: number, synthesisDurMs?: number, audioDurMs?: number): void {
    this.t_tts_complete = Date.now();
    if (ttfbMs !== undefined && ttfbMs >= 0) {
      this.markTtsFirstByte(ttfbMs);
    }
  }

  // ── Avatar rendering latency (LemonSlice) ──────────────────────────────
  private t_avatar_render_start: number | undefined;
  private t_avatar_first_frame: number | undefined;
  private t_client_render_ms: number | undefined;
  private _avatarFrameTimeoutHandle: ReturnType<typeof setTimeout> | undefined;
  private _pipelineReportTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

  markClientRenderMs(ms: number): void {
    this.t_client_render_ms = ms;
    // If the pipeline report was waiting for this metric, print it now!
    if (this._pipelineReportTimeoutHandle) {
      clearTimeout(this._pipelineReportTimeoutHandle);
      this._pipelineReportTimeoutHandle = undefined;
      this.logPipelineReport(false);
    }
  }

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
    
    // Wait for the frontend granular telemetry (Data Channel) to arrive before printing
    // If it arrives, markClientRenderMs will clear this timeout and print instantly.
    if (this.t_client_render_ms !== undefined) {
      this.logPipelineReport(isFallback);
    } else {
      this._pipelineReportTimeoutHandle = setTimeout(() => {
        this._pipelineReportTimeoutHandle = undefined;
        this.logPipelineReport(isFallback);
      }, 1000); // Wait up to 1 second for frontend metric
    }
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
    // JSON payload removed to declutter terminal
  }

  logRotation(reason: string): void {
    // JSON payload removed to declutter terminal
  }

  /** Prints a human-readable comprehensive timing summary after each full turn. */
  public logPipelineReport(isFallback = false): void {
    const fallbackTag = isFallback ? ' [TIMEOUT_FALLBACK]' : '';
    const diff = (end?: number, start?: number) => (end && start && end >= start) ? `${end - start}ms` : '?';
    
    const eou = diff(this.t_llm_start, this.pendingUserTurnEnd);
    const llm_ttft = diff(this.t_llm_first_token, this.t_llm_start);
    const llm_total = diff(this.t_llm_complete, this.t_llm_start);
    const tts_ttfb = diff(this.t_tts_first_byte, this.t_tts_start);
    const tts_total = diff(this.t_tts_complete, this.t_tts_start);
    const avatar_render = diff(this.t_avatar_first_frame, this.t_tts_first_byte);
    const e2e = diff(this.t_avatar_first_frame, this.pendingUserTurnEnd);

    // stt_done: use persisted duration if raw timestamps were wiped by startTurn()
    const sttDone = this.t_stt_duration_ms !== undefined ? `${this.t_stt_duration_ms}ms` : '?';

    // Advanced Telemetry Breakdown
    const hasGranularTelemetry = this.t_client_render_ms !== undefined && typeof avatar_render === 'string' && avatar_render.endsWith('ms');
    let renderLine = `  • LemonSlice Render & Network (TTS TTFB → Avatar Frame): ${avatar_render}\n`;
    if (hasGranularTelemetry) {
      const totalRenderOverhead = parseInt(avatar_render, 10);
      const networkHopTime = Math.max(0, totalRenderOverhead - this.t_client_render_ms!);
      renderLine = `  • LemonSlice Local Render Time (from Frontend): ${this.t_client_render_ms}ms\n` +
                   `  • Network Transit Overhead (RTT): ${networkHopTime}ms\n`;
    }

    console.log(
      `\n[pipeline][${ts()}] ── TURN ${this.turnNumber} METRICS SUMMARY${fallbackTag} ──\n` +
      `  • STT Processing: ${sttDone}\n` +
      `  • EOU Delay (User End → LLM Start): ${eou}\n` +
      `  • LLM TTFT (LLM Start → First Token): ${llm_ttft}\n` +
      `  • LLM Total (LLM Start → Complete): ${llm_total}\n` +
      `  • TTS TTFB (TTS Start → First Audio Byte): ${tts_ttfb}\n` +
      `  • TTS Total (TTS Start → Complete): ${tts_total}\n` +
      renderLine +
      `  • E2E Latency (User End → Avatar Frame): ${e2e}\n` +
      `───────────────────────────────────────────────────`
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
    // console.log(JSON.stringify({ type: 'ailana-metrics', event: 'turn', ...payload }));
  }

  logContextSize(itemCount: number, estimatedTokens: number): void {
    this.logTurn({ contextItemCount: itemCount, estimatedContextTokens: estimatedTokens });
  }
}
