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

/** Something was paid and nothing is left; a free order is never "paid in full". */
export function paidInFull(order: Payments): boolean {
  return paidSoFar(order) > 0 && outstanding(order) <= 0;
}

/** "owes" only once delivered: before that, an unpaid order is simply not due yet. */
export function paymentBadge(order: Payments & Pick<Order, 'status'>): PaymentBadge {
  if (order.status === 'cancelled') return null;
  if (paidInFull(order)) return 'paid';
  if (order.status === 'delivered' && outstanding(order) > 0) return 'owes';
  return null;
}

type OwingOrder = Payments & Pick<Order, 'status' | 'deliveryDate' | 'createdAt'>;

/**
 * Delivered and still owing, oldest delivery first: the diary's "don't forget" line and the
 * money screen's list are the same orders.
 */
export function owingOrders<T extends OwingOrder>(orders: T[]): T[] {
  return orders
    .filter((o) => paymentBadge(o) === 'owes')
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate) || a.createdAt.localeCompare(b.createdAt));
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
 * The order detail shows all four, the current one marked, and any can be tapped (D29):
 * a mis-tap is undone by tapping the status it should have been.
 */
export const allStatuses: OrderStatus[] = ['new', 'confirmed', 'delivered', 'cancelled'];

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
