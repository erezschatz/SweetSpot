import { useLiveQuery } from 'dexie-react-hooks';
import { customersRepo, ordersRepo, settingsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { formatDay, formatMonth, localIsoDate } from '../lib/dates';
import { formatShekels, monthIncome, monthOf, previousMonth, sum } from '../lib/money';
import { outstanding, owingOrders } from '../lib/orders';
import { href } from '../lib/route';
import { paymentReminderLink } from '../ui/whatsapp-buttons';

// Step 08: what came in this month and last, and who still owes what. Every figure is
// derived from the orders; nothing here is stored.
export function MoneyScreen() {
  const orders = useLiveQuery(() => ordersRepo.all());
  const customers = useLiveQuery(() => customersRepo.all());
  const settings = useLiveQuery(() => settingsRepo.get());
  if (!orders || !customers || !settings) return null;

  // Read on each render: the screen is short-lived, and a stale month only lasts until she leaves it.
  const thisMonth = monthOf(localIsoDate(new Date()));
  const lastMonth = previousMonth(thisMonth);
  const owing = owingOrders(orders);
  const byId = new Map(customers.map((c) => [c.id, c]));

  return (
    <section class="money">
      <div class="two">
        <div class="figure">
          <span class="muted">
            {he.money.thisMonth} · {formatMonth(thisMonth)}
          </span>
          <strong>{formatShekels(monthIncome(orders, thisMonth))}</strong>
        </div>
        <div class="figure">
          <span class="muted">
            {he.money.lastMonth} · {formatMonth(lastMonth)}
          </span>
          <strong>{formatShekels(monthIncome(orders, lastMonth))}</strong>
        </div>
      </div>
      <p class="muted">{he.money.incomeHint}</p>

      <h2>
        {he.money.owing}
        {owing.length > 0 && <span class="muted"> · {formatShekels(sum(owing.map(outstanding)))}</span>}
      </h2>
      {owing.length === 0 && <p class="muted">{he.money.nobodyOwes}</p>}
      <ul class="cards">
        {owing.map((order) => {
          const customer = byId.get(order.customerId);
          const reminder = paymentReminderLink(order, customer, settings);
          return (
            <li key={order.id} class="owing">
              <a class="card" href={href({ name: 'order', id: order.id })}>
                <div class="card-top">
                  <strong>{customer?.name || order.title}</strong>
                  <span>
                    {he.money.left} {formatShekels(outstanding(order))}
                  </span>
                </div>
                <div class="card-bottom">
                  <span class="muted">{formatDay(order.deliveryDate)}</span>
                </div>
              </a>
              {reminder && (
                <a class="button whatsapp-button" href={reminder} target="_blank" rel="noopener">
                  {he.money.remind}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
