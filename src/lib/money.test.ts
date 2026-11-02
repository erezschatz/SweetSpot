import { describe, expect, it } from 'vitest';
import { agorotToInput, formatShekels, parseShekels, sum } from './money';

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
