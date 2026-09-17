import { memo } from 'react';
import type { SeverityFilter, TimeWindowMinutes } from '../types/event';

type FilterPanelProps = {
  severityFilter: SeverityFilter;
  timeWindow: TimeWindowMinutes;
  bufferSize: number;
  throttleMs: number;
  onSeverityChange: (filter: SeverityFilter) => void;
  onTimeWindowChange: (window: TimeWindowMinutes) => void;
  onBufferSizeChange: (size: number) => void;
  onThrottleChange: (ms: number) => void;
};

function FilterPanel({
  severityFilter,
  timeWindow,
  bufferSize,
  throttleMs,
  onSeverityChange,
  onTimeWindowChange,
  onBufferSizeChange,
  onThrottleChange,
}: FilterPanelProps) {
  return (
    <section className="filter-panel" aria-label="Dashboard filters">
      <h2 className="filter-panel__title">Filters</h2>
      <div className="filter-panel__fields">
        <label className="field" htmlFor="filter-severity">
          <span>Severity</span>
          <select
            id="filter-severity"
            value={severityFilter}
            onChange={(e) => onSeverityChange(e.target.value as SeverityFilter)}
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </label>

        <label className="field" htmlFor="filter-time-window">
          <span>Time window</span>
          <select
            id="filter-time-window"
            value={timeWindow}
            onChange={(e) => onTimeWindowChange(Number(e.target.value) as TimeWindowMinutes)}
          >
            <option value={1}>Last 1 min</option>
            <option value={5}>Last 5 min</option>
            <option value={15}>Last 15 min</option>
          </select>
        </label>

        <label className="field" htmlFor="filter-buffer-size">
          <span>Buffer size</span>
          <input
            id="filter-buffer-size"
            type="number"
            min={50}
            max={2000}
            step={50}
            value={bufferSize}
            onChange={(e) => onBufferSizeChange(Number(e.target.value))}
          />
        </label>

        <label className="field" htmlFor="filter-throttle">
          <span>Throttle (ms)</span>
          <input
            id="filter-throttle"
            type="number"
            min={50}
            max={1000}
            step={50}
            value={throttleMs}
            onChange={(e) => onThrottleChange(Number(e.target.value))}
          />
        </label>
      </div>
    </section>
  );
}

export default memo(FilterPanel);
