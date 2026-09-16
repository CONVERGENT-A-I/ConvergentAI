const SESSION_KEY = "ailana_session";
const TAB_ALIVE_KEY = "ailana_tab_alive";
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;
const MAX_TRANSCRIPT_ENTRIES = 50;

export type ChatEntry = {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: number;
};

export type AilanaSessionSnapshot = {
  sessionId: string;
  roomName: string;
  activeStage: string;
  flowPhase: string;
  pendingMode: string;
  borrowerProfile: any;
  isAffordabilityPanelOpen: boolean;
  hasSubmittedAus: boolean;
  panelClosedByUser: boolean;
  chatTranscript: ChatEntry[];
  timestamp: number;
};

export function saveSession(snapshot: AilanaSessionSnapshot): void {
  try {
    const trimmed: AilanaSessionSnapshot = {
      ...snapshot,
      chatTranscript: snapshot.chatTranscript.slice(-MAX_TRANSCRIPT_ENTRIES),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(trimmed));
  } catch {
    // QuotaExceededError or SecurityError in strict contexts
  }
}

export function loadSession(): AilanaSessionSnapshot | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const snapshot: AilanaSessionSnapshot = JSON.parse(raw);
    if (!snapshot?.timestamp) return null;
    if (Date.now() - snapshot.timestamp > SESSION_TTL_MS) {
      clearSession();
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function isSessionRecoverable(): boolean {
  return loadSession() !== null;
}

export function markTabAlive(): void {
  try {
    sessionStorage.setItem(TAB_ALIVE_KEY, "1");
  } catch {
    // ignore
  }
}

export function clearStaleOnRefresh(): void {
  try {
    if (typeof window !== "undefined" && typeof performance !== "undefined") {
      const navEntries = performance.getEntriesByType("navigation");
      const isReload =
        navEntries.length > 0
          ? (navEntries[0] as PerformanceNavigationTiming).type === "reload"
          : (window.performance as any)?.navigation?.type === 1;

      if (isReload) {
        clearSession();
        return;
      }
    }

    const isAlive = sessionStorage.getItem(TAB_ALIVE_KEY);
    if (!isAlive) {
      clearSession();
    }
  } catch {
    // ignore
  }
}

export function getStageName(stage: string): string {
  const stageMap: Record<string, string> = {
    "1": "Introduction",
    "2": "Discovery Questions",
    "2.5": "Affordability Summary",
    "3": "Contact Verification",
    "4": "Credit Review",
    "5": "Pre-Qualification Results",
  };
  return stageMap[stage] ?? `Stage ${stage}`;
}