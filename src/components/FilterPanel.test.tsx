import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterPanel from './FilterPanel';

describe('FilterPanel', () => {
  const defaultProps = {
    severityFilter: 'all' as const,
    timeWindow: 5 as const,
    bufferSize: 500,
    throttleMs: 100,
    onSeverityChange: vi.fn(),
    onTimeWindowChange: vi.fn(),
    onBufferSizeChange: vi.fn(),
    onThrottleChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter controls with current values', () => {
    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByLabelText('Severity')).toHaveValue('all');
    expect(screen.getByLabelText('Time window')).toHaveValue('5');
    expect(screen.getByLabelText('Buffer size')).toHaveValue(500);
    expect(screen.getByLabelText('Throttle (ms)')).toHaveValue(100);
  });

  it('calls change handlers when filters are updated', async () => {
    const user = userEvent.setup();
    render(<FilterPanel {...defaultProps} />);

    await user.selectOptions(screen.getByLabelText('Severity'), 'critical');
    await user.selectOptions(screen.getByLabelText('Time window'), '15');
    await user.clear(screen.getByLabelText('Buffer size'));
    await user.type(screen.getByLabelText('Buffer size'), '1000');
    await user.clear(screen.getByLabelText('Throttle (ms)'));
    await user.type(screen.getByLabelText('Throttle (ms)'), '250');

    expect(defaultProps.onSeverityChange).toHaveBeenCalledWith('critical');
    expect(defaultProps.onTimeWindowChange).toHaveBeenCalledWith(15);
    expect(defaultProps.onBufferSizeChange).toHaveBeenCalled();
    expect(defaultProps.onThrottleChange).toHaveBeenCalled();
  });
});
