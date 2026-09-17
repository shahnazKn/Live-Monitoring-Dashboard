import { StreamClient } from './streamClient';

function createClient(overrides: Partial<ConstructorParameters<typeof StreamClient>[0]> = {}) {
  const onEvent = vi.fn();
  const onStatus = vi.fn();
  const onError = vi.fn();

  const client = new StreamClient({
    tickMs: 100,
    burstSize: 1,
    onEvent,
    onStatus,
    onError,
    ...overrides,
  });

  return { client, onEvent, onStatus, onError };
}

describe('StreamClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('transitions from connecting to live after handshake', () => {
    const { client, onStatus } = createClient();
    client.connect();

    expect(onStatus).toHaveBeenCalledWith('connecting');

    vi.advanceTimersByTime(400);
    expect(onStatus).toHaveBeenCalledWith('live');
    expect(client.getStatus()).toBe('live');
  });

  it('pauses and resumes without emitting while paused', () => {
    const { client, onEvent, onStatus } = createClient();
    client.connect();
    vi.advanceTimersByTime(400);

    client.pause();
    expect(onStatus).toHaveBeenCalledWith('paused');
    expect(client.getStatus()).toBe('paused');

    onEvent.mockClear();
    vi.advanceTimersByTime(500);
    expect(onEvent).not.toHaveBeenCalled();

    client.resume();
    expect(onStatus).toHaveBeenCalledWith('live');
  });

  it('reconnects with exponential backoff after a simulated drop', () => {
    const { client, onStatus } = createClient();
    client.connect();
    vi.advanceTimersByTime(400);

    client.simulateDrop();
    expect(onStatus).toHaveBeenCalledWith('reconnecting');

    vi.advanceTimersByTime(500);
    expect(onStatus).toHaveBeenCalledWith('live');
    expect(client.getStatus()).toBe('live');
  });

  it('enters error state after max reconnect attempts', () => {
    const { client, onStatus, onError } = createClient({ maxReconnectAttempts: 1 });
    client.connect();
    vi.advanceTimersByTime(400);

    client.simulateDrop();
    client.simulateDrop();

    expect(onStatus).toHaveBeenCalledWith('error');
    expect(onError).toHaveBeenCalledWith(
      'Unable to restore the live connection. Try resume to retry.',
    );
    expect(client.getStatus()).toBe('error');
  });
});
