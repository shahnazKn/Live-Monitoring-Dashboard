import type { StreamEvent } from '../types/event';

export function makeEvent(overrides: Partial<StreamEvent> = {}): StreamEvent {
  return {
    id: 'evt-1',
    timestamp: Date.now(),
    service: 'api-gateway',
    severity: 'info',
    message: 'Health check passed',
    metric: 42,
    ...overrides,
  };
}

export function makeValidPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: 'evt-1',
    timestamp: Date.now(),
    service: 'api-gateway',
    severity: 'info',
    message: 'Health check passed',
    metric: 42,
    ...overrides,
  };
}
