import {
  clamp,
  computeKpis,
  filterDashboardEvents,
  pushBoundedMany,
} from './helpers';
import { makeEvent } from '../test/fixtures';

describe('clamp', () => {
  it('keeps values within bounds', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-1, 0, 100)).toBe(0);
    expect(clamp(500, 0, 200)).toBe(200);
  });
});

describe('filterDashboardEvents', () => {
  const now = 1_700_000_000_000;

  it('filters by time window and severity', () => {
    const events = [
      makeEvent({ id: '1', timestamp: now - 30_000, severity: 'critical' }),
      makeEvent({ id: '2', timestamp: now - 120_000, severity: 'info' }),
      makeEvent({ id: '3', timestamp: now - 20_000, severity: 'info' }),
    ];

    expect(filterDashboardEvents(events, 1, 'all', now)).toHaveLength(2);
    expect(filterDashboardEvents(events, 1, 'critical', now)).toHaveLength(1);
    expect(filterDashboardEvents(events, 1, 'critical', now)[0].id).toBe('1');
  });
});

describe('computeKpis', () => {
  it('returns zeroed KPIs for an empty set', () => {
    expect(computeKpis([], 5)).toEqual({
      totalEvents: 0,
      eventsPerSecond: 0,
      criticalCount: 0,
      warningCount: 0,
      infoCount: 0,
      averageMetric: 0,
    });
  });

  it('computes counts, rate, and average metric', () => {
    const events = [
      makeEvent({ id: '1', timestamp: 1_000, severity: 'critical', metric: 80 }),
      makeEvent({ id: '2', timestamp: 3_000, severity: 'warning', metric: 40 }),
      makeEvent({ id: '3', timestamp: 5_000, severity: 'info', metric: 20 }),
    ];

    const kpis = computeKpis(events, 5);

    expect(kpis.totalEvents).toBe(3);
    expect(kpis.criticalCount).toBe(1);
    expect(kpis.warningCount).toBe(1);
    expect(kpis.infoCount).toBe(1);
    expect(kpis.averageMetric).toBeCloseTo(46.666, 2);
    expect(kpis.eventsPerSecond).toBeCloseTo(0.75, 5);
  });
});

describe('pushBoundedMany', () => {
  it('caps the combined buffer to the configured size', () => {
    const result = pushBoundedMany([1, 2, 3], [4, 5, 6], 5);
    expect(result).toEqual([2, 3, 4, 5, 6]);
  });

  it('returns the original buffer when no items are added', () => {
    const buffer = [1, 2];
    expect(pushBoundedMany(buffer, [], 5)).toBe(buffer);
  });
});
