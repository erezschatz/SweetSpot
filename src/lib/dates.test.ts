import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, formatDay, localIsoDate, parseIsoDate, weekdayName, weekStart } from './dates';

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

describe('addDays', () => {
  it('crosses month and year ends', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('steps one calendar day across a DST change', () => {
    // Israel moves its clocks on the last Friday before April and the last Sunday of October.
    expect(addDays('2026-03-27', 1)).toBe('2026-03-28');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
  });
});

describe('weekStart', () => {
  it('is the Sunday on or before the day', () => {
    expect(weekStart('2026-11-08')).toBe('2026-11-08'); // Sunday
    expect(weekStart('2026-11-12')).toBe('2026-11-08'); // Thursday
    expect(weekStart('2026-11-14')).toBe('2026-11-08'); // Saturday
  });

  it('can fall in the previous month or year', () => {
    expect(weekStart('2027-01-01')).toBe('2026-12-27'); // a Friday
  });
});

describe('daysBetween', () => {
  it('counts whole days either way', () => {
    expect(daysBetween('2026-11-01', '2026-11-08')).toBe(7);
    expect(daysBetween('2026-11-08', '2026-11-01')).toBe(-7);
    expect(daysBetween('2026-11-08', '2026-11-08')).toBe(0);
  });

  it('is not thrown off by a 25-hour night', () => {
    expect(daysBetween('2026-10-24', '2026-10-27')).toBe(3);
  });
});

describe('weekdayName', () => {
  it('names the day in Hebrew', () => {
    expect(weekdayName('2026-11-12')).toContain('חמישי');
    expect(weekdayName('2026-11-14')).toContain('שבת');
  });
});
