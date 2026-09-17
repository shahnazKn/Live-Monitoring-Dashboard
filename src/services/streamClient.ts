import type { ConnectionStatus, StreamEvent } from '../types/event';
import { validateStreamEvent } from '../utils/validate';

export type StreamClientOptions = {
  /** Simulated emit interval; lower = higher load for performance testing */
  tickMs?: number;
  /** Burst size per tick — exercises batching / backpressure */
  burstSize?: number;
  /** Max reconnect attempts before entering error state */
  maxReconnectAttempts?: number;
  onEvent: (event: StreamEvent) => void;
  onStatus: (status: ConnectionStatus) => void;
  onError: (message: string) => void;
};

const SERVICES = ['api-gateway', 'auth-service', 'billing', 'notifications', 'search'] as const;
const SEVERITIES = ['info', 'warning', 'critical'] as const;
const MESSAGES = [
  'Request completed successfully',
  'Elevated latency detected',
  'Retry queue depth increasing',
  'Circuit breaker half-open',
  'Cache miss ratio above threshold',
  'Upstream timeout recovered',
  'Health check passed',
  'Disk pressure warning',
] as const;

/**
 * Simulated live stream client.
 * Keeps connection / reconnect logic out of React components.
 * No secrets: auth would stay in memory only if a real socket were used.
 */
export class StreamClient {
  private readonly tickMs: number;
  private readonly burstSize: number;
  private readonly maxReconnectAttempts: number;
  private readonly onEvent: StreamClientOptions['onEvent'];
  private readonly onStatus: StreamClientOptions['onStatus'];
  private readonly onError: StreamClientOptions['onError'];

  private timerId: ReturnType<typeof setInterval> | null = null;
  private reconnectTimerId: ReturnType<typeof setTimeout> | null = null;
  private status: ConnectionStatus = 'connecting';
  private paused = false;
  private reconnectAttempt = 0;
  private seq = 0;
  private intentionallyClosed = false;

  constructor(options: StreamClientOptions) {
    this.tickMs = options.tickMs ?? 40;
    this.burstSize = options.burstSize ?? 3;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 8;
    this.onEvent = options.onEvent;
    this.onStatus = options.onStatus;
    this.onError = options.onError;
  }

  connect(): void {
    this.intentionallyClosed = false;
    this.clearReconnectTimer();
    this.setStatus('connecting');

    // Simulate handshake latency, then go live
    window.setTimeout(() => {
      if (this.intentionallyClosed) return;
      this.reconnectAttempt = 0;
      this.startEmitting();
      this.setStatus(this.paused ? 'paused' : 'live');
    }, 400);
  }

  pause(): void {
    this.paused = true;
    if (this.status === 'live') {
      this.setStatus('paused');
    }
  }

  resume(): void {
    this.paused = false;
    if (this.status === 'paused') {
      this.setStatus('live');
    } else if (this.status === 'error') {
      this.connect();
    }
  }

  /** Force a drop to demonstrate reconnect + backoff (demo / QA helper). */
  simulateDrop(): void {
    if (this.intentionallyClosed) return;
    this.stopEmitting();
    this.setStatus('reconnecting');
    this.scheduleReconnect();
  }

  disconnect(): void {
    this.intentionallyClosed = true;
    this.stopEmitting();
    this.clearReconnectTimer();
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  private startEmitting(): void {
    this.stopEmitting();
    this.timerId = setInterval(() => {
      if (this.paused || this.status === 'reconnecting' || this.status === 'error') {
        return;
      }

      // Occasional simulated network flap under load
      if (Math.random() < 0.002) {
        this.simulateDrop();
        return;
      }

      for (let i = 0; i < this.burstSize; i += 1) {
        const raw = this.createRawPayload();
        // Occasionally emit garbage to prove validation drops bad messages
        const payload = Math.random() < 0.02 ? { broken: true } : raw;
        const event = validateStreamEvent(payload);
        if (event) {
          this.onEvent(event);
        }
      }
    }, this.tickMs);
  }

  private createRawPayload(): Record<string, unknown> {
    this.seq += 1;
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const base =
      severity === 'critical' ? 80 + Math.random() * 40 : severity === 'warning' ? 40 + Math.random() * 40 : Math.random() * 40;

    return {
      id: `evt-${this.seq}-${Date.now()}`,
      timestamp: Date.now(),
      service: SERVICES[Math.floor(Math.random() * SERVICES.length)],
      severity,
      message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
      metric: Number(base.toFixed(2)),
    };
  }

  private scheduleReconnect(): void {
    if (this.intentionallyClosed) return;

    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      // Generic message only — no internal details for attackers / logs
      this.setStatus('error');
      this.onError('Unable to restore the live connection. Try resume to retry.');
      return;
    }

    const delay = Math.min(10_000, 500 * 2 ** this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.setStatus('reconnecting');

    this.reconnectTimerId = setTimeout(() => {
      if (this.intentionallyClosed) return;
      this.startEmitting();
      this.reconnectAttempt = 0;
      this.setStatus(this.paused ? 'paused' : 'live');
    }, delay);
  }

  private stopEmitting(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimerId !== null) {
      clearTimeout(this.reconnectTimerId);
      this.reconnectTimerId = null;
    }
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.onStatus(status);
  }
}
