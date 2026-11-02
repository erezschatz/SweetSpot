import { useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Order } from '../db/schema';
import { ordersRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { formatDay } from '../lib/dates';
import { formatShekels } from '../lib/money';
import { listOrders } from '../lib/orders';
import { href } from '../lib/route';
import { PaymentBadge, StatusBadge } from '../ui/badges';

export function OrdersScreen() {
  const [showClosed, setShowClosed] = useState(false);
  const orders = useLiveQuery(() => ordersRepo.all());
  if (!orders) return null;

  const visible = listOrders(orders, showClosed);

  return (
    <section>
      <h2>{he.orders.title}</h2>
      <label class="toggle">
        <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.currentTarget.checked)} />
        <span>{he.orders.showClosed}</span>
      </label>

      {visible.length === 0 && <p class="muted">{he.orders.empty}</p>}
      <ul class="cards">
        {visible.map((order) => (
          <li key={order.id}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>

      <a class="fab" href={href({ name: 'orderNew' })}>+ {he.orders.newOrder}</a>
    </section>
  );
}

function OrderCard({ order }: { order: Order }) {
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
        <span>{formatDay(order.deliveryDate)}</span>
        <span class="badges">
          <StatusBadge status={order.status} />
          <PaymentBadge order={order} />
        </span>
      </div>
    </a>
  );
}
