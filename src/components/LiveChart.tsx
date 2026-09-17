import { memo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartPoint } from '../types/event';
import { formatTime } from '../utils/helpers';

type LiveChartProps = {
  data: ChartPoint[];
};

function LiveChart({ data }: LiveChartProps) {
  if (data.length === 0) {
    return (
      <section className="panel chart-panel">
        <header className="panel__header">
          <h2>Live metric</h2>
        </header>
        <div className="empty-state">Waiting for metric samples…</div>
      </section>
    );
  }

  const chartRows = data.map((point) => ({
    time: formatTime(point.timestamp),
    value: point.value,
  }));

  return (
    <section className="panel chart-panel">
      <header className="panel__header">
        <h2>Live metric</h2>
        <span className="panel__meta">{data.length} points</span>
      </header>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartRows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eaef" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={36}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 6,
                border: '1px solid #e8eaef',
                boxShadow: '0 4px 12px rgba(17, 24, 39, 0.06)',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default memo(LiveChart);
