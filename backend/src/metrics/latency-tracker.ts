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

export class LatencyTracker {
  private sessionStartAt = Date.now();
  private turnNumber = 0;
  private pendingUserTurnEnd?: number;
  private pendingGenerateReply?: number;

  startTurn(): number {
    this.turnNumber += 1;
    return this.turnNumber;
  }

  markUserTurnEnd(): void {
    this.pendingUserTurnEnd = Date.now();
  }

  markGenerateReply(): void {
    this.pendingGenerateReply = Date.now();
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
    this.logTurn({ ttftMs, estimatedContextTokens: inputTokens });
  }

  logCompaction(itemsBefore: number, itemsAfter: number): void {
    console.log(
      JSON.stringify({
        type: 'ailana-metrics',
        event: 'context_compaction',
        itemsBefore,
        itemsAfter,
        turnNumber: this.turnNumber,
        sessionAgeMs: Date.now() - this.sessionStartAt,
      }),
    );
  }

  logRotation(reason: string): void {
    console.log(
      JSON.stringify({
        type: 'ailana-metrics',
        event: 'session_rotation',
        reason,
        turnNumber: this.turnNumber,
        sessionAgeMs: Date.now() - this.sessionStartAt,
      }),
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
