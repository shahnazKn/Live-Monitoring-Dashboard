import { memo } from 'react';
import type { ConnectionStatus } from '../types/event';

type ConnectionBarProps = {
  status: ConnectionStatus;
  errorMessage: string | null;
  onPause: () => void;
  onResume: () => void;
  onSimulateDrop: () => void;
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: 'Connecting',
  live: 'Live',
  paused: 'Paused',
  reconnecting: 'Reconnecting',
  error: 'Error',
};

function ConnectionBar({
  status,
  errorMessage,
  onPause,
  onResume,
  onSimulateDrop,
}: ConnectionBarProps) {
  const isPaused = status === 'paused';
  const canPause = status === 'live';
  const canResume = isPaused || status === 'error';

  return (
    <section className="connection-bar" aria-label="Connection controls">
      <div className="connection-bar__status">
        <span className={`status-dot status-dot--${status}`} aria-hidden />
        <div>
          <p className="connection-bar__label">{STATUS_LABEL[status]}</p>
          {errorMessage ? <p className="connection-bar__error">{errorMessage}</p> : null}
        </div>
      </div>

      <div className="connection-bar__actions">
        <button type="button" className="btn" onClick={onPause} disabled={!canPause}>
          Pause
        </button>
        <button type="button" className="btn btn--primary" onClick={onResume} disabled={!canResume}>
          Resume
        </button>
        <button type="button" className="btn btn--ghost" onClick={onSimulateDrop}>
          Simulate drop
        </button>
      </div>
    </section>
  );
}

export default memo(ConnectionBar);
