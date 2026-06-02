export type FlowPhase =
  | "idle"
  | "connecting"
  | "intro"
  | "live"
  | "error"
  | "closing-mlo";

export type PendingMode =
  | "intro-avatar"
  | "video"
  | "voice"
  | "avatar-chat"
  | "loan-officer"
  | "tts-avatar";
