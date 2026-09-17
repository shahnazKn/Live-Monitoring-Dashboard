import type { DashboardKpis, SeverityFilter, StreamEvent, TimeWindowMinutes } from '../types/event';

export const DEFAULT_BUFFER_SIZE = 500;
export const DEFAULT_THROTTLE_MS = 100;
export const DEFAULT_CHART_POINTS = 60;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatNumber(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(digits);
}

export function windowStartMs(windowMinutes: TimeWindowMinutes, now = Date.now()): number {
  return now - windowMinutes * 60_000;
}

export function filterEventsByWindow(
  events: StreamEvent[],
  windowMinutes: TimeWindowMinutes,
  now = Date.now(),
): StreamEvent[] {
  const start = windowStartMs(windowMinutes, now);
  return events.filter((event) => event.timestamp >= start);
}

export function filterDashboardEvents(
  events: StreamEvent[],
  timeWindow: TimeWindowMinutes,
  severityFilter: SeverityFilter,
  now = Date.now(),
): StreamEvent[] {
  const windowed = filterEventsByWindow(events, timeWindow, now);
  if (severityFilter === 'all') return windowed;
  return windowed.filter((event) => event.severity === severityFilter);
}

export function computeKpis(events: StreamEvent[], windowMinutes: TimeWindowMinutes): DashboardKpis {
  const windowed = events;
  const totalEvents = windowed.length;

  if (totalEvents === 0) {
    return {
      totalEvents: 0,
      eventsPerSecond: 0,
      criticalCount: 0,
      warningCount: 0,
      infoCount: 0,
      averageMetric: 0,
    };
  }

  let criticalCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  let metricSum = 0;

  for (const event of windowed) {
    metricSum += event.metric;
    if (event.severity === 'critical') criticalCount += 1;
    else if (event.severity === 'warning') warningCount += 1;
    else infoCount += 1;
  }

  const newest = windowed[windowed.length - 1].timestamp;
  const oldest = windowed[0].timestamp;
  const spanSeconds = Math.max(1, (newest - oldest) / 1000);
  const windowSeconds = windowMinutes * 60;

  return {
    totalEvents,
    eventsPerSecond: totalEvents / Math.min(spanSeconds, windowSeconds),
    criticalCount,
    warningCount,
    infoCount,
    averageMetric: metricSum / totalEvents,
  };
}

export function pushBounded<T>(buffer: T[], item: T, maxSize: number): T[] {
  const next = buffer.length >= maxSize ? buffer.slice(buffer.length - maxSize + 1) : buffer.slice();
  next.push(item);
  return next;
}

export function pushBoundedMany<T>(buffer: T[], items: T[], maxSize: number): T[] {
  if (items.length === 0) return buffer;
  const combined = buffer.concat(items);
  if (combined.length <= maxSize) return combined;
  return combined.slice(combined.length - maxSize);
}
