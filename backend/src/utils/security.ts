import type { Request } from 'express';

const SECRET_KEY_PATTERN = /(api[_-]?key|api[_-]?secret|authorization|password|secret|token|sessionid)/gi;
const JWT_PATTERN = /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g;
const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi;

export function safeErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  return raw
    .replace(JWT_PATTERN, '[REDACTED_JWT]')
    .replace(BEARER_PATTERN, 'Bearer [REDACTED]')
    .replace(new RegExp(`(["']?${SECRET_KEY_PATTERN.source}["']?\\s*[:=]\\s*)[^,}\\s]+`, 'gi'), '$1[REDACTED]')
    .slice(0, 500);
}

export function requestKey(req: Request, scope: string): string {
  return `${scope}:${req.ip || req.socket.remoteAddress || 'unknown'}`;
}

const buckets = new Map<string, number[]>();

export function allowRequest(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 10_000) {
    for (const [bucketKey, hits] of buckets) {
      if (!hits.some((timestamp) => now - timestamp < windowMs)) buckets.delete(bucketKey);
    }
  }
  return true;
}

export function safeTelemetryDetails(details: unknown): Record<string, string | number | boolean> {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return {};
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(details).slice(0, 12)) {
    const isSecretKey = SECRET_KEY_PATTERN.test(key);
    SECRET_KEY_PATTERN.lastIndex = 0;
    if (isSecretKey) continue;
    if (typeof value === 'number' || typeof value === 'boolean') result[key.slice(0, 64)] = value;
    if (typeof value === 'string') result[key.slice(0, 64)] = safeErrorMessage(value).slice(0, 160);
  }
  return result;
}
