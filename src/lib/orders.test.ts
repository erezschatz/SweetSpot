import { describe, expect, it } from 'vitest';
import type { Order } from '../db/schema';
import { clearPayment, listOrders, nextStatuses, orderTotal, outstanding, paidSoFar, paymentBadge, recordPayment } from './orders';

const base = { total: 32000, paidAmount: 0, status: 'confirmed' as const };

describe('orderTotal', () => {
  it('adds qty × unit price over the lines', () => {
    expect(orderTotal([{ qty: 1, unitPrice: 32000 }, { qty: 12, unitPrice: 800 }])).toBe(41600);
    expect(orderTotal([])).toBe(0);
  });
});

describe('paidSoFar and outstanding', () => {
  it('counts a deposit only once it is paid', () => {
    expect(paidSoFar({ ...base, deposit: 10000 })).toBe(0);
    expect(paidSoFar({ ...base, deposit: 10000, depositPaidAt: '2026-11-02' })).toBe(10000);
  });

  it('counts the payment only once it has a date', () => {
    expect(paidSoFar({ ...base, paidAmount: 22000 })).toBe(0);
    expect(paidSoFar({ ...base, paidAmount: 22000, paidAt: '2026-11-20' })).toBe(22000);
  });

  it('is total minus deposit minus payment', () => {
    const order = { ...base, deposit: 10000, depositPaidAt: '2026-11-02', paidAmount: 22000, paidAt: '2026-11-20' };
    expect(outstanding(order)).toBe(0);
    expect(outstanding({ ...order, paidAt: undefined })).toBe(22000);
  });
});

describe('paymentBadge', () => {
  it('says nothing before delivery when nothing is paid', () => {
    expect(paymentBadge({ ...base, status: 'new' })).toBeNull();
    expect(paymentBadge(base)).toBeNull();
  });

  it('says nothing for a deposit that leaves money still to pay before delivery', () => {
    expect(paymentBadge({ ...base, deposit: 10000, depositPaidAt: '2026-11-02' })).toBeNull();
  });

  it('says owes once delivered and not fully paid', () => {
    expect(paymentBadge({ ...base, status: 'delivered' })).toBe('owes');
    expect(paymentBadge({ ...base, status: 'delivered', deposit: 10000, depositPaidAt: '2026-11-02' })).toBe('owes');
  });

  it('says paid when fully paid, delivered or not', () => {
    expect(paymentBadge({ ...base, paidAmount: 32000, paidAt: '2026-11-01' })).toBe('paid');
    expect(paymentBadge({ ...base, status: 'delivered', paidAmount: 40000, paidAt: '2026-11-20' })).toBe('paid');
  });

  it('says nothing for a cancelled order', () => {
    expect(paymentBadge({ ...base, status: 'cancelled', deposit: 10000, depositPaidAt: '2026-11-02' })).toBeNull();
  });

  it('does not call a free order paid', () => {
    expect(paymentBadge({ ...base, total: 0, status: 'delivered' })).toBeNull();
  });
});

describe('listOrders', () => {
  const o = (id: string, deliveryDate: string, status: Order['status'], createdAt = '2026-11-01T00:00:00Z') =>
    ({ id, deliveryDate, status, createdAt });
  const orders = [
    o('late', '2026-11-30', 'new'),
    o('done', '2026-11-05', 'delivered'),
    o('soon-b', '2026-11-10', 'confirmed', '2026-11-02T00:00:00Z'),
    o('soon-a', '2026-11-10', 'new', '2026-11-01T00:00:00Z'),
    o('off', '2026-11-12', 'cancelled'),
  ];

  it('sorts by delivery date, then by when it was entered, and hides closed orders', () => {
    expect(listOrders(orders, false).map((x) => x.id)).toEqual(['soon-a', 'soon-b', 'late']);
  });

  it('shows closed orders when asked', () => {
    expect(listOrders(orders, true).map((x) => x.id)).toEqual(['done', 'soon-a', 'soon-b', 'off', 'late']);
  });

  it('does not reorder the array it was given', () => {
    const copy = [...orders];
    listOrders(orders, true);
    expect(orders).toEqual(copy);
  });
});

describe('nextStatuses', () => {
  it('offers a way back from every status', () => {
    expect(nextStatuses('new')).toEqual(['confirmed', 'delivered', 'cancelled']);
    expect(nextStatuses('confirmed')).toEqual(['delivered', 'cancelled']);
    expect(nextStatuses('delivered')).toEqual(['confirmed']);
    expect(nextStatuses('cancelled')).toEqual(['new']);
  });
});

describe('recordPayment / clearPayment', () => {
  const order: Order = {
    id: 'o1', customerId: 'c1', title: 'דנה', items: [], deliveryDate: '2026-11-19', fulfilment: 'pickup',
    designNotes: '', notes: '', status: 'delivered', total: 32000, paidAmount: 0,
    deposit: 10000, depositPaidAt: '2026-11-02', depositMethod: 'bit',
    createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z',
  };
  const now = '2026-11-20T10:00:00Z';

  it('records the remaining amount and makes the order paid', () => {
    const paid = recordPayment(order, { amount: outstanding(order), date: '2026-11-20', method: 'cash' }, now);
    expect([paid.paidAmount, paid.paidAt, paid.paidMethod, paid.updatedAt]).toEqual([22000, '2026-11-20', 'cash', now]);
    expect(paymentBadge(paid)).toBe('paid');
    expect(paid.depositPaidAt).toBe('2026-11-02');
  });

  it('replaces an earlier payment, including dropping its method when none is given', () => {
    const first = recordPayment(order, { amount: 22000, date: '2026-11-20', method: 'cash' }, now);
    const second = recordPayment(first, { amount: 20000, date: '2026-11-21' }, now);
    expect([second.paidAmount, second.paidAt, second.paidMethod]).toEqual([20000, '2026-11-21', undefined]);
    expect('paidMethod' in second).toBe(false);
    expect(paymentBadge(second)).toBe('owes');
  });

  it('clears the payment back to owing, keeping the deposit', () => {
    const cleared = clearPayment(recordPayment(order, { amount: 22000, date: '2026-11-20', method: 'bit' }, now), now);
    expect([cleared.paidAmount, cleared.paidAt, cleared.paidMethod, cleared.deposit]).toEqual([0, undefined, undefined, 10000]);
    expect(paymentBadge(cleared)).toBe('owes');
  });
});
