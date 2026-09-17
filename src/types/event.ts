export type EventSeverity = 'info' | 'warning' | 'critical';

export type ConnectionStatus =
  | 'connecting'
  | 'live'
  | 'paused'
  | 'reconnecting'
  | 'error';

export interface StreamEvent {
  id: string;
  timestamp: number;
  service: string;
  severity: EventSeverity;
  message: string;
  metric: number;
}

export interface ChartPoint {
  timestamp: number;
  value: number;
}

export interface DashboardKpis {
  totalEvents: number;
  eventsPerSecond: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  averageMetric: number;
}

export type SeverityFilter = 'all' | EventSeverity;

export type TimeWindowMinutes = 1 | 5 | 15;
