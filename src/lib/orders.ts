import type { Order, OrderItem, OrderStatus, PaymentMethod } from '../db/schema';
import { sum, type Agorot } from './money';

// The arithmetic of docs/SPEC.md "Derived, never stored". Payment is after delivery and a
// deposit is the exception (D16); "paid" is a badge, not a status (D17).

export function lineTotal(item: Pick<OrderItem, 'qty' | 'unitPrice'>): Agorot {
  return item.qty * item.unitPrice;
}

export function orderTotal(items: Pick<OrderItem, 'qty' | 'unitPrice'>[]): Agorot {
  return sum(items.map(lineTotal));
}

type Payments = Pick<Order, 'total' | 'deposit' | 'depositPaidAt' | 'paidAmount' | 'paidAt'>;

export function paidSoFar(order: Omit<Payments, 'total'>): Agorot {
  const deposit = order.depositPaidAt ? (order.deposit ?? 0) : 0;
  const payment = order.paidAt ? order.paidAmount : 0;
  return deposit + payment;
}

export function outstanding(order: Payments): Agorot {
  return order.total - paidSoFar(order);
}

export type PaymentBadge = 'paid' | 'owes' | null;

/** "owes" only once delivered: before that, an unpaid order is simply not due yet. */
export function paymentBadge(order: Payments & Pick<Order, 'status'>): PaymentBadge {
  if (order.status === 'cancelled') return null;
  const paid = paidSoFar(order);
  if (paid > 0 && outstanding(order) <= 0) return 'paid';
  if (order.status === 'delivered' && outstanding(order) > 0) return 'owes';
  return null;
}

const closed: OrderStatus[] = ['delivered', 'cancelled'];

/** The orders list: by delivery date, delivered and cancelled hidden unless asked for. */
export function listOrders<T extends Pick<Order, 'status' | 'deliveryDate' | 'createdAt'>>(
  orders: T[],
  showClosed: boolean,
): T[] {
  return orders
    .filter((o) => showClosed || !closed.includes(o.status))
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate) || a.createdAt.localeCompare(b.createdAt));
}

/**
 * The status buttons the order detail offers. Every move has a way back, because a
 * mis-tap on a phone is more likely than a real reversal and must not be permanent.
 */
export function nextStatuses(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case 'new':
      return ['confirmed', 'delivered', 'cancelled'];
    case 'confirmed':
      return ['delivered', 'cancelled'];
    case 'delivered':
      return ['confirmed'];
    case 'cancelled':
      return ['new'];
  }
}

/** The one payment tap (D16): replaces any earlier final payment on the order. */
export function recordPayment(
  order: Order,
  payment: { amount: Agorot; date: string; method?: PaymentMethod },
  now: string,
): Order {
  const { paidMethod: _old, ...rest } = order;
  return {
    ...rest,
    paidAmount: payment.amount,
    paidAt: payment.date,
    ...(payment.method ? { paidMethod: payment.method } : {}),
    updatedAt: now,
  };
}

export function clearPayment(order: Order, now: string): Order {
  const { paidAt: _a, paidMethod: _m, ...rest } = order;
  return { ...rest, paidAmount: 0, updatedAt: now };
}
