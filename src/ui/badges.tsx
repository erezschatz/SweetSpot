import type { Order } from '../db/schema';
import { he } from '../i18n/he';
import { formatShekels } from '../lib/money';
import { outstanding, paymentBadge } from '../lib/orders';

// The pipeline lives on the card itself, not hidden in the detail (docs/PREDECESSOR.md).
export function StatusBadge({ status }: { status: Order['status'] }) {
  return <span class={`badge status-${status}`}>{he.status[status]}</span>;
}

export function PaymentBadge({ order }: { order: Order }) {
  const badge = paymentBadge(order);
  if (badge === 'paid') return <span class="badge paid">{he.orders.paid}</span>;
  if (badge === 'owes') {
    return <span class="badge owes">{he.orders.owes} {formatShekels(outstanding(order))}</span>;
  }
  return null;
}
