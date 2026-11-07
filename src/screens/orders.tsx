import { useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import { ordersRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { listOrders } from '../lib/orders';
import { href } from '../lib/route';
import { OrderCard } from '../ui/order-card';

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
