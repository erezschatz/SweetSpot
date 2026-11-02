import { describe, expect, it } from 'vitest';
import { localIsoDate } from './dates';

describe('localIsoDate', () => {
  it('pads month and day', () => {
    expect(localIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('uses the local day, not the UTC one', () => {
    // 00:30 local time is still "today" whatever the offset.
    expect(localIsoDate(new Date(2026, 10, 2, 0, 30))).toBe('2026-11-02');
  });
});
