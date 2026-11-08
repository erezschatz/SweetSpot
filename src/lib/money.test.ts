import { describe, expect, it } from 'vitest';
import { agorotToInput, formatShekels, monthIncome, monthOf, parseShekels, previousMonth, sum } from './money';

describe('parseShekels', () => {
  it('reads plain and decorated numbers', () => {
    expect(parseShekels('120')).toBe(12000);
    expect(parseShekels('120.5')).toBe(12050);
    expect(parseShekels('₪1,200')).toBe(120000);
    expect(parseShekels('450 ש"ח')).toBe(45000);
  });
  it('returns null for no number', () => {
    expect(parseShekels('')).toBeNull();
    expect(parseShekels('לא ידוע')).toBeNull();
  });
  it('reads "-0" as plain 0', () => {
    expect(Object.is(parseShekels('-0'), 0)).toBe(true);
  });
  it('rounds to the agora', () => {
    expect(parseShekels('0.005')).toBe(1);
  });
});

describe('formatShekels', () => {
  it('shows whole shekels without decimals and halves with', () => {
    expect(formatShekels(45000)).toMatch(/450/);
    expect(formatShekels(45000)).not.toMatch(/\.00/);
    expect(formatShekels(12050)).toMatch(/120[.,]5/);
  });
});

describe('sum', () => {
  it('adds agorot exactly', () => {
    expect(sum([1, 2, 3])).toBe(6);
    expect(sum([])).toBe(0);
  });
});

describe('agorotToInput', () => {
  it('gives back what parseShekels reads', () => {
    expect(agorotToInput(32000)).toBe('320');
    expect(agorotToInput(12050)).toBe('120.5');
    expect(agorotToInput(0)).toBe('0');
    for (const a of [1, 99, 12345, 100000]) expect(parseShekels(agorotToInput(a))).toBe(a);
  });
});

describe('months', () => {
  it('reads the month of a date and steps back across a year', () => {
    expect(monthOf('2026-11-08')).toBe('2026-11');
    expect(previousMonth('2026-11')).toBe('2026-10');
    expect(previousMonth('2026-01')).toBe('2025-12');
    expect(previousMonth('2026-10')).toBe('2026-09');
  });
});

describe('monthIncome', () => {
  const none = { paidAmount: 0 };
  it('counts a deposit in its month and the payment in its own', () => {
    const order = { deposit: 10000, depositPaidAt: '2026-10-28', paidAmount: 25000, paidAt: '2026-11-03' };
    expect(monthIncome([order], '2026-10')).toBe(10000);
    expect(monthIncome([order], '2026-11')).toBe(25000);
    expect(monthIncome([order], '2026-12')).toBe(0);
  });
  it('ignores amounts with no paid date', () => {
    expect(monthIncome([{ deposit: 10000, paidAmount: 5000 }, none], '2026-11')).toBe(0);
  });
  it('adds up several orders exactly, first and last day of the month included', () => {
    const orders = [
      { paidAmount: 12050, paidAt: '2026-11-01' },
      { paidAmount: 30000, paidAt: '2026-11-30' },
      { deposit: 5000, depositPaidAt: '2026-11-15', paidAmount: 0 },
      { paidAmount: 99999, paidAt: '2026-12-01' },
    ];
    expect(monthIncome(orders, '2026-11')).toBe(47050);
  });
  it('counts what a cancelled order received, since it was received', () => {
    // monthIncome takes no status; the screen passes cancelled orders in like any other.
    expect(monthIncome([{ deposit: 10000, depositPaidAt: '2026-11-02', paidAmount: 0 }], '2026-11')).toBe(10000);
  });
});
