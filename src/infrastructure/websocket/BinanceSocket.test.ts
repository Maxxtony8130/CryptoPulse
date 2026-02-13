import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculateBackoffDelay } from './BinanceSocket';

describe('calculateBackoffDelay', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses exponential backoff with jitter', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(calculateBackoffDelay(1)).toBe(1000);
    expect(calculateBackoffDelay(2)).toBe(2000);
    expect(calculateBackoffDelay(3)).toBe(4000);
  });

  it('caps backoff at max retry window', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(calculateBackoffDelay(8)).toBe(30000);
    expect(calculateBackoffDelay(12)).toBe(30000);
  });
});
