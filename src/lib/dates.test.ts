import { describe, expect, it } from 'vitest';
import { formatDay, localIsoDate, parseIsoDate } from './dates';

describe('localIsoDate', () => {
  it('pads month and day', () => {
    expect(localIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('uses the local day, not the UTC one', () => {
    // 00:30 local time is still "today" whatever the offset.
    expect(localIsoDate(new Date(2026, 10, 2, 0, 30))).toBe('2026-11-02');
  });
});

describe('parseIsoDate', () => {
  it('is local midnight of that day', () => {
    const d = parseIsoDate('2026-11-19');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 19, 0]);
    expect(localIsoDate(d)).toBe('2026-11-19');
  });
});

describe('formatDay', () => {
  it('shows the day of the month and a Hebrew weekday', () => {
    const text = formatDay('2026-11-19');
    expect(text).toContain('19');
    expect(text).toMatch(/[\u0590-\u05FF]/);
  });
});
