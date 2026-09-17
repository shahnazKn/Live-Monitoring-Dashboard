import { memo } from 'react';
import type { DashboardKpis, SeverityFilter, TimeWindowMinutes } from '../types/event';
import { formatNumber } from '../utils/helpers';

type KpiCardsProps = {
  kpis: DashboardKpis;
  timeWindow: TimeWindowMinutes;
  severityFilter: SeverityFilter;
};

type CardProps = {
  label: string;
  value: string;
  tone?: 'default' | 'warning' | 'critical' | 'success';
};

const Card = memo(function Card({ label, value, tone = 'default' }: CardProps) {
  return (
    <article className={`kpi-card kpi-card--${tone}`}>
      <p className="kpi-card__label">{label}</p>
      <p className="kpi-card__value">{value}</p>
    </article>
  );
});

const SEVERITY_LABEL: Record<SeverityFilter, string> = {
  all: 'All severities',
  info: 'Info only',
  warning: 'Warning only',
  critical: 'Critical only',
};

function KpiCards({ kpis, timeWindow, severityFilter }: KpiCardsProps) {
  const scope = `${timeWindow} min · ${SEVERITY_LABEL[severityFilter]}`;

  return (
    <section aria-label="Key performance indicators">
      <p className="kpi-grid__scope">KPIs reflect: {scope}</p>
      <div className="kpi-grid">
        <Card label="Events (filtered)" value={String(kpis.totalEvents)} />
        <Card label="Events / sec" value={formatNumber(kpis.eventsPerSecond, 2)} tone="success" />
        <Card label="Avg metric" value={formatNumber(kpis.averageMetric, 1)} />
        <Card label="Critical" value={String(kpis.criticalCount)} tone="critical" />
        <Card label="Warning" value={String(kpis.warningCount)} tone="warning" />
        <Card label="Info" value={String(kpis.infoCount)} />
      </div>
    </section>
  );
}

export default memo(KpiCards);
