import { memo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { StreamEvent } from '../types/event';
import { formatTime } from '../utils/helpers';

type EventsListProps = {
  events: StreamEvent[];
};

function EventsList({ events }: EventsListProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 8,
  });

  return (
    <section className="panel events-panel">
      <header className="panel__header">
        <h2>Recent events</h2>
        <span className="panel__meta">{events.length} shown</span>
      </header>

      {events.length === 0 ? (
        <div className="empty-state">No events in the selected window / filter.</div>
      ) : (
        <div ref={parentRef} className="events-scroll" role="list" aria-label="Live events">
          <div
            className="events-inner"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((row) => {
              const event = events[events.length - 1 - row.index];
              return (
                <article
                  key={event.id}
                  role="listitem"
                  className={`event-row event-row--${event.severity}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${row.size}px`,
                    transform: `translateY(${row.start}px)`,
                  }}
                >
                  <div className="event-row__top">
                    <span className={`badge badge--${event.severity}`}>{event.severity}</span>
                    <span className="event-row__service">{event.service}</span>
                    <time dateTime={new Date(event.timestamp).toISOString()}>
                      {formatTime(event.timestamp)}
                    </time>
                  </div>
                  <p className="event-row__message">{event.message}</p>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(EventsList);
