import { render, screen } from '@testing-library/react';
import KpiCards from './KpiCards';

describe('KpiCards', () => {
  it('renders KPI values and active filter scope', () => {
    render(
      <KpiCards
        timeWindow={5}
        severityFilter="critical"
        kpis={{
          totalEvents: 12,
          eventsPerSecond: 2.5,
          criticalCount: 12,
          warningCount: 0,
          infoCount: 0,
          averageMetric: 88.4,
        }}
      />,
    );

    expect(screen.getByText('KPIs reflect: 5 min · Critical only')).toBeInTheDocument();
    expect(screen.getByText('Events (filtered)')).toBeInTheDocument();
    expect(screen.getByText('2.50')).toBeInTheDocument();
    expect(screen.getByText('88.4')).toBeInTheDocument();
    expect(screen.getAllByText('12')).toHaveLength(2);
  });
});
