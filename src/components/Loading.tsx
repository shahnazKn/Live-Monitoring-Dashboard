import { memo } from 'react';

type LoadingProps = {
  label?: string;
};

function Loading({ label = 'Connecting to live stream…' }: LoadingProps) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden />
      <p>{label}</p>
    </div>
  );
}

export default memo(Loading);
