import { llm, type voice } from '@livekit/agents';
import type { LLM } from '@livekit/agents-plugin-openai';
import { ailanaConfig } from '../config/ailana-config.js';
import type { LatencyTracker } from '../metrics/latency-tracker.js';

export type TurnLogEntry = {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
};

export class SessionContextManager {
  private turnLog: TurnLogEntry[] = [];
  private turnCount = 0;
  private lastCompactAt = Date.now();
  private lastRotationAt = Date.now();
  private conversationSummary: string | null = null;
  private compacting = false;

  constructor(
    private readonly summarizationLlm: LLM,
    private readonly metrics: LatencyTracker,
  ) {}

  onUserTurn(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('SYSTEM_')) return;
    this.turnLog.push({ role: 'user', text: trimmed, timestamp: Date.now() });
    this.turnCount += 1;
  }

  onAgentTurn(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    this.turnLog.push({ role: 'assistant', text: trimmed, timestamp: Date.now() });
  }

  getTurnCount(): number {
    return this.turnCount;
  }

  getConversationSummary(): string | null {
    return this.conversationSummary;
  }

  /** Build OpenAI chat messages for text-only mode (summary + recent turns). */
  buildTextMessages(systemPrompt: string): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (this.conversationSummary) {
      messages.push({
        role: 'system',
        content: `Earlier in this session:\n${this.conversationSummary}`,
      });
    }

    const recent = this.turnLog.slice(-(ailanaConfig.keepRecentTurns * 2));
    for (const entry of recent) {
      messages.push({ role: entry.role, content: entry.text });
    }

    return messages;
  }

  shouldCompact(): boolean {
    const ageMs = Date.now() - this.lastCompactAt;
    return (
      this.turnCount >= ailanaConfig.compactEveryNTurns ||
      ageMs >= ailanaConfig.compactEveryMs
    );
  }

  shouldRotateSession(): boolean {
    const ageMs = Date.now() - this.lastRotationAt;
    return (
      this.turnCount >= ailanaConfig.rotateEveryNTurns ||
      ageMs >= ailanaConfig.rotateSessionMs
    );
  }

  estimateTokensFromChatCtx(chatCtx: llm.ChatContext): number {
    let chars = 0;
    for (const item of chatCtx.items) {
      if (item.type === 'message') {
        chars += (item.textContent ?? '').length;
      }
    }
    return Math.ceil(chars / 4);
  }

  async maybeCompact(session: voice.AgentSession, agent: voice.Agent): Promise<boolean> {
    if (this.compacting || !this.shouldCompact()) return false;
    return this.compact(session, agent);
  }

  async compact(session: voice.AgentSession, agent: voice.Agent): Promise<boolean> {
    if (this.compacting) return false;
    this.compacting = true;

    try {
      const chatCtx = session.chatCtx;
      const itemsBefore = chatCtx.items.length;

      if (itemsBefore <= ailanaConfig.keepRecentTurns * 2) {
        this.lastCompactAt = Date.now();
        return false;
      }

      const summarized = await chatCtx._summarize(this.summarizationLlm, {
        keepLastTurns: ailanaConfig.keepRecentTurns,
      });

      const summaryItem = summarized.items.find(
        (item) =>
          item.type === 'message' &&
          item.role === 'assistant' &&
          item.extra?.is_summary === true,
      );

      if (summaryItem && summaryItem.type === 'message') {
        const raw = summaryItem.textContent ?? '';
        const match = raw.match(/<chat_history_summary>\s*([\s\S]*?)\s*<\/chat_history_summary>/);
        this.conversationSummary = match?.[1]?.trim() ?? raw.trim();
      }

      await agent.updateChatCtx(summarized);

      const itemsAfter = summarized.items.length;
      this.metrics.logCompaction(itemsBefore, itemsAfter);
      this.metrics.logContextSize(itemsAfter, this.estimateTokensFromChatCtx(summarized));
      this.lastCompactAt = Date.now();
      this.turnCount = 0;

      console.log(
        `[context]: Compacted ${itemsBefore} → ${itemsAfter} items (keeping last ${ailanaConfig.keepRecentTurns} turns)`,
      );
      return true;
    } catch (err) {
      console.error('[context]: Compaction failed:', err);
      // Prevent immediate retries on every turn by resetting the clock
      this.lastCompactAt = Date.now();
      this.turnCount = 0;
      return false;
    } finally {
      this.compacting = false;
    }
  }

  async maybeRotate(
    session: voice.AgentSession,
    createAgent: (summary: string | null) => voice.Agent,
  ): Promise<boolean> {
    if (!this.shouldRotateSession()) return false;
    return this.rotate(session, createAgent);
  }

  async rotate(
    session: voice.AgentSession,
    createAgent: (summary: string | null) => voice.Agent,
  ): Promise<boolean> {
    try {
      // Ensure we have an up-to-date summary before rotation
      const chatCtx = session.chatCtx;
      if (chatCtx.items.length > 4) {
        const summarized = await chatCtx._summarize(this.summarizationLlm, {
          keepLastTurns: 2,
        });
        const summaryItem = summarized.items.find(
          (item) =>
            item.type === 'message' &&
            item.role === 'assistant' &&
            item.extra?.is_summary === true,
        );
        if (summaryItem && summaryItem.type === 'message') {
          const raw = summaryItem.textContent ?? '';
          const match = raw.match(/<chat_history_summary>\s*([\s\S]*?)\s*<\/chat_history_summary>/);
          this.conversationSummary = match?.[1]?.trim() ?? raw.trim();
        }
        const newAgent = createAgent(this.conversationSummary);
        session.updateAgent(newAgent);
        await newAgent.updateChatCtx(summarized);
      } else {
        const newAgent = createAgent(this.conversationSummary);
        session.updateAgent(newAgent);
      }

      this.metrics.logRotation('scheduled');
      this.lastRotationAt = Date.now();
      this.lastCompactAt = Date.now();
      this.turnCount = 0;

      console.log('[context]: Session rotated with summary reseed');
      return true;
    } catch (err) {
      console.error('[context]: Session rotation failed:', err);
      // Prevent immediate retries on every turn by resetting the clock
      this.lastRotationAt = Date.now();
      this.lastCompactAt = Date.now();
      this.turnCount = 0;
      return false;
    }
  }
}
