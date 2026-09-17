import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StreamClient } from '../services/streamClient';
import type {
  ChartPoint,
  ConnectionStatus,
  DashboardKpis,
  SeverityFilter,
  StreamEvent,
  TimeWindowMinutes,
} from '../types/event';
import {
  DEFAULT_BUFFER_SIZE,
  DEFAULT_CHART_POINTS,
  DEFAULT_THROTTLE_MS,
  clamp,
  computeKpis,
  filterDashboardEvents,
  pushBoundedMany,
} from '../utils/helpers';

export type UseLiveStreamOptions = {
  bufferSize?: number;
  throttleMs?: number;
  chartPoints?: number;
};

export type UseLiveStreamResult = {
  status: ConnectionStatus;
  errorMessage: string | null;
  events: StreamEvent[];
  filteredEvents: StreamEvent[];
  chartData: ChartPoint[];
  kpis: DashboardKpis;
  severityFilter: SeverityFilter;
  timeWindow: TimeWindowMinutes;
  bufferSize: number;
  throttleMs: number;
  setSeverityFilter: (filter: SeverityFilter) => void;
  setTimeWindow: (window: TimeWindowMinutes) => void;
  setBufferSize: (size: number) => void;
  setThrottleMs: (ms: number) => void;
  pause: () => void;
  resume: () => void;
  simulateDrop: () => void;
};

export function useLiveStream(options: UseLiveStreamOptions = {}): UseLiveStreamResult {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [timeWindow, setTimeWindow] = useState<TimeWindowMinutes>(5);
  const [bufferSize, setBufferSizeState] = useState(
    options.bufferSize ?? DEFAULT_BUFFER_SIZE,
  );
  const [throttleMs, setThrottleMsState] = useState(
    options.throttleMs ?? DEFAULT_THROTTLE_MS,
  );
  // Re-evaluate sliding time windows even when the feed is paused and no new events arrive
  const [viewTick, setViewTick] = useState(0);

  const clientRef = useRef<StreamClient | null>(null);
  const pendingRef = useRef<StreamEvent[]>([]);
  const bufferSizeRef = useRef(bufferSize);
  const throttleMsRef = useRef(throttleMs);
  const chartPoints = options.chartPoints ?? DEFAULT_CHART_POINTS;

  useEffect(() => {
    bufferSizeRef.current = bufferSize;
  }, [bufferSize]);

  useEffect(() => {
    throttleMsRef.current = throttleMs;
  }, [throttleMs]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setViewTick((tick) => tick + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Flush pending stream events on a throttle so React does not re-render per message
  useEffect(() => {
    const flush = () => {
      if (pendingRef.current.length === 0) return;
      const batch = pendingRef.current;
      pendingRef.current = [];
      setEvents((prev) => pushBoundedMany(prev, batch, bufferSizeRef.current));
    };

    const id = window.setInterval(flush, throttleMs);
    return () => {
      window.clearInterval(id);
      flush();
    };
  }, [throttleMs]);

  useEffect(() => {
    const client = new StreamClient({
      onEvent: (event) => {
        pendingRef.current.push(event);
      },
      onStatus: (next) => {
        setStatus(next);
        if (next === 'live' || next === 'paused') {
          setErrorMessage(null);
        }
      },
      onError: (message) => {
        setErrorMessage(message);
      },
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
      pendingRef.current = [];
    };
  }, []);

  // Cap buffer immediately when the configured size shrinks
  useEffect(() => {
    setEvents((prev) =>
      prev.length > bufferSize ? prev.slice(prev.length - bufferSize) : prev,
    );
  }, [bufferSize]);

  const pause = useCallback(() => {
    clientRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    clientRef.current?.resume();
  }, []);

  const simulateDrop = useCallback(() => {
    clientRef.current?.simulateDrop();
  }, []);

  const setBufferSize = useCallback((size: number) => {
    setBufferSizeState(clamp(Math.round(size), 50, 2000));
  }, []);

  const setThrottleMs = useCallback((ms: number) => {
    setThrottleMsState(clamp(Math.round(ms), 50, 1000));
  }, []);

  const filteredEvents = useMemo(() => {
    void viewTick;
    return filterDashboardEvents(events, timeWindow, severityFilter);
  }, [events, severityFilter, timeWindow, viewTick]);

  const kpis = useMemo(
    () => computeKpis(filteredEvents, timeWindow),
    [filteredEvents, timeWindow],
  );

  const chartData = useMemo((): ChartPoint[] => {
    const windowed = filteredEvents;
    if (windowed.length === 0) return [];

    const step = Math.max(1, Math.floor(windowed.length / chartPoints));
    const points: ChartPoint[] = [];

    for (let i = windowed.length - 1; i >= 0; i -= step) {
      points.push({
        timestamp: windowed[i].timestamp,
        value: windowed[i].metric,
      });
      if (points.length >= chartPoints) break;
    }

    return points.reverse();
  }, [filteredEvents, chartPoints]);

  return {
    status,
    errorMessage,
    events,
    filteredEvents,
    chartData,
    kpis,
    severityFilter,
    timeWindow,
    bufferSize,
    throttleMs,
    setSeverityFilter,
    setTimeWindow,
    setBufferSize,
    setThrottleMs,
    pause,
    resume,
    simulateDrop,
  };
}
