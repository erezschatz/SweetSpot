import { describe, expect, it } from 'vitest';
import type { Customer, Order } from '../db/schema';
import { customerHistory, findByPhone, fromContact, matchCustomers } from './customers';

const c = (id: string, name: string, phone: string): Customer => ({ id, name, phone, notes: '', createdAt: '' });
const all = [c('1', 'דנה לוי', '050-1234567'), c('2', 'מיכל כהן', '+972 52 765 4321'), c('3', 'Dana Cohen', '0541112233')];
const ids = (q: string) => matchCustomers(all, q).map((x) => x.id);

describe('matchCustomers', () => {
  it('returns everyone for an empty query', () => {
    expect(ids('  ')).toEqual(['1', '2', '3']);
  });

  it('matches part of a name, ignoring case', () => {
    expect(ids('כהן')).toEqual(['2']);
    expect(ids('dana')).toEqual(['3']);
  });

  it('matches digits whatever the punctuation', () => {
    expect(ids('0501')).toEqual(['1']);
    expect(ids('050-123')).toEqual(['1']);
    expect(ids('765 43')).toEqual(['2']);
  });

  it('matches 972 and 05x forms against each other', () => {
    expect(ids('052765')).toEqual(['2']);
    expect(ids('972501')).toEqual(['1']);
  });

  it('does not match on a single digit', () => {
    expect(ids('5')).toEqual([]);
  });
});

describe('fromContact', () => {
  it('takes the name and prefers an Israeli mobile among several numbers', () => {
    expect(fromContact({ name: [' דנה לוי '], tel: ['03-1234567', '+972 50-123-4567'] })).toEqual({
      name: 'דנה לוי',
      phone: '+972 50-123-4567',
    });
  });

  it('falls back to the first number, and to empty when the contact has none', () => {
    expect(fromContact({ name: ['דנה'], tel: ['03-1234567', '04-7654321'] }).phone).toBe('03-1234567');
    expect(fromContact({ name: [], tel: [] })).toEqual({ name: '', phone: '' });
    expect(fromContact({})).toEqual({ name: '', phone: '' });
  });
});

describe('findByPhone', () => {
  it('finds the same number written another way', () => {
    expect(findByPhone(all, '+972-50-1234567')?.id).toBe('1');
    expect(findByPhone(all, '0527654321')?.id).toBe('2');
  });

  it('skips the customer being edited, and finds nothing for an unusable number', () => {
    expect(findByPhone(all, '050-1234567', '1')).toBeUndefined();
    expect(findByPhone(all, '')).toBeUndefined();
    expect(findByPhone(all, '050-1239999')).toBeUndefined();
  });
});

describe('customerHistory', () => {
  const o = (deliveryDate: string, extra: Partial<Order> = {}) => ({
    deliveryDate, createdAt: '2026-10-01T00:00:00Z', total: 32000, paidAmount: 0, ...extra,
  });

  it('lists newest first and adds up what she paid, deposits and payments', () => {
    const history = customerHistory([
      o('2026-09-01', { paidAmount: 32000, paidAt: '2026-09-02' }),
      o('2026-11-19', { deposit: 10000, depositPaidAt: '2026-11-02' }),
      o('2026-10-05'),
    ]);
    expect(history.orders.map((x) => x.deliveryDate)).toEqual(['2026-11-19', '2026-10-05', '2026-09-01']);
    expect(history.totalPaid).toBe(42000);
  });

  it('is empty for a customer with no orders', () => {
    expect(customerHistory([])).toEqual({ orders: [], totalPaid: 0 });
  });
});
