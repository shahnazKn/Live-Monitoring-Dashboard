import { sanitizeText, validateStreamEvent } from './validate';
import { makeValidPayload } from '../test/fixtures';

describe('sanitizeText', () => {
  it('strips HTML tags and dangerous characters', () => {
    expect(sanitizeText('<script>alert(1)</script>hello', 100)).toBe('alert(1)hello');
    expect(sanitizeText('safe "quoted" text', 100)).toBe('safe quoted text');
  });

  it('enforces max length', () => {
    expect(sanitizeText('abcdefghij', 5)).toBe('abcde');
  });
});

describe('validateStreamEvent', () => {
  it('accepts a well-formed payload', () => {
    const result = validateStreamEvent(makeValidPayload());
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('info');
    expect(result?.metric).toBe(42);
  });

  it('rejects non-object payloads', () => {
    expect(validateStreamEvent(null)).toBeNull();
    expect(validateStreamEvent('bad')).toBeNull();
  });

  it('rejects invalid severity and missing fields', () => {
    expect(validateStreamEvent(makeValidPayload({ severity: 'fatal' }))).toBeNull();
    expect(validateStreamEvent({ broken: true })).toBeNull();
  });

  it('rejects timestamps outside the allowed window', () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);

    expect(validateStreamEvent(makeValidPayload({ timestamp: now + 120_000 }))).toBeNull();
    expect(validateStreamEvent(makeValidPayload({ timestamp: now - 86_400_001 }))).toBeNull();

    vi.restoreAllMocks();
  });

  it('clamps metric to a safe numeric range', () => {
    expect(validateStreamEvent(makeValidPayload({ metric: -10 }))?.metric).toBe(0);
    expect(validateStreamEvent(makeValidPayload({ metric: 9_999_999 }))?.metric).toBe(1_000_000);
  });
});
