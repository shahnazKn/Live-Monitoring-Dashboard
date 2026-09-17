import type { EventSeverity, StreamEvent } from '../types/event';

const ALLOWED_SEVERITIES = new Set<EventSeverity>(['info', 'warning', 'critical']);
const MAX_MESSAGE_LENGTH = 280;
const MAX_SERVICE_LENGTH = 64;

/** Strip markup so stream text cannot inject HTML even if rendered incorrectly later. */
export function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`]/g, '')
    .trim()
    .slice(0, maxLength);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Treat every streamed payload as untrusted.
 * Returns null for malformed messages so callers can drop them safely.
 */
export function validateStreamEvent(payload: unknown): StreamEvent | null {
  if (payload === null || typeof payload !== 'object') {
    return null;
  }

  const raw = payload as Record<string, unknown>;

  if (!isNonEmptyString(raw.id)) return null;
  if (!isFiniteNumber(raw.timestamp) || raw.timestamp <= 0) return null;
  if (!isNonEmptyString(raw.service)) return null;
  if (!isNonEmptyString(raw.severity)) return null;
  if (!isNonEmptyString(raw.message)) return null;
  if (!isFiniteNumber(raw.metric)) return null;

  const severity = raw.severity.toLowerCase() as EventSeverity;
  if (!ALLOWED_SEVERITIES.has(severity)) return null;

  const service = sanitizeText(raw.service, MAX_SERVICE_LENGTH);
  const message = sanitizeText(raw.message, MAX_MESSAGE_LENGTH);

  if (!service || !message) return null;

  // Reject absurd future skew / stale poison that could break time-window logic
  const now = Date.now();
  if (raw.timestamp > now + 60_000 || raw.timestamp < now - 86_400_000) {
    return null;
  }

  return {
    id: sanitizeText(raw.id, 64),
    timestamp: raw.timestamp,
    service,
    severity,
    message,
    metric: Math.max(0, Math.min(raw.metric, 1_000_000)),
  };
}
