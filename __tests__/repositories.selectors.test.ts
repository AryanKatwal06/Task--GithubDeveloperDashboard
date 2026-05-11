import { selectIsDataStale } from '../src/store/slices/repositories/selectors';

const makeState = (lastFetchTime: number | null) => ({
  repositories: {
    lastFetchTime,
  },
});

describe('selectIsDataStale', () => {
  it('returns true when never fetched', () => {
    const state = makeState(null as any);
    expect(selectIsDataStale(state as any)).toBe(true);
  });

  it('returns false when last fetch is recent', () => {
    const now = Date.now();
    const state = makeState(now - 1 * 60 * 1000); // 1 minute ago
    expect(selectIsDataStale(state as any)).toBe(false);
  });

  it('returns true when last fetch is older than TTL', () => {
    const now = Date.now();
    const state = makeState(now - 10 * 60 * 1000); // 10 minutes ago
    expect(selectIsDataStale(state as any)).toBe(true);
  });
});
