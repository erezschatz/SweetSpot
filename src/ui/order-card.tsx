import type { Order } from '../db/schema';
import { he } from '../i18n/he';
import { formatDay } from '../lib/dates';
import { formatShekels } from '../lib/money';
import { href } from '../lib/route';
import { PaymentBadge, StatusBadge } from './badges';

// One order as a card, on the orders list and in the diary. `showDate` is off where the
// card already sits under its day's heading.
export function OrderCard({ order, showDate = true }: { order: Order; showDate?: boolean }) {
  const [first, ...rest] = order.items;
  return (
    <a class={`card status-${order.status}`} href={href({ name: 'order', id: order.id })}>
      <div class="card-top">
        <strong>{order.title}</strong>
        <span>{formatShekels(order.total)}</span>
      </div>
      {first && (
        <p class="card-line">
          {first.qty > 1 && `${first.qty} × `}
          {first.name}
          {first.details && <span class="muted">, {first.details}</span>}
          {rest.length > 0 && <span class="muted"> ({he.orders.moreLines} {rest.length})</span>}
        </p>
      )}
      <div class="card-bottom">
        <span>{showDate ? formatDay(order.deliveryDate) : ''}</span>
        <span class="badges">
          <StatusBadge status={order.status} />
          <PaymentBadge order={order} />
        </span>
      </div>
    </a>
  );
}
