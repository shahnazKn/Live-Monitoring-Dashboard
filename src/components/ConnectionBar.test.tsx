import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectionBar from './ConnectionBar';

describe('ConnectionBar', () => {
  it('renders the current connection status', () => {
    render(
      <ConnectionBar
        status="live"
        errorMessage={null}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onSimulateDrop={vi.fn()}
      />,
    );

    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows a generic error message when provided', () => {
    render(
      <ConnectionBar
        status="error"
        errorMessage="Unable to restore the live connection. Try resume to retry."
        onPause={vi.fn()}
        onResume={vi.fn()}
        onSimulateDrop={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Unable to restore the live connection. Try resume to retry.'),
    ).toBeInTheDocument();
  });

  it('enables pause only while live and resume while paused or in error', () => {
    const onPause = vi.fn();
    const onResume = vi.fn();

    const { rerender } = render(
      <ConnectionBar
        status="live"
        errorMessage={null}
        onPause={onPause}
        onResume={onResume}
        onSimulateDrop={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Pause' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Resume' })).toBeDisabled();

    rerender(
      <ConnectionBar
        status="paused"
        errorMessage={null}
        onPause={onPause}
        onResume={onResume}
        onSimulateDrop={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Pause' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Resume' })).toBeEnabled();
  });

  it('calls action handlers from the control buttons', async () => {
    const user = userEvent.setup();
    const onPause = vi.fn();
    const onResume = vi.fn();
    const onSimulateDrop = vi.fn();

    render(
      <ConnectionBar
        status="live"
        errorMessage={null}
        onPause={onPause}
        onResume={onResume}
        onSimulateDrop={onSimulateDrop}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('button', { name: 'Simulate drop' }));

    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onSimulateDrop).toHaveBeenCalledTimes(1);
  });
});
