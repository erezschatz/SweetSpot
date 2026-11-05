import { useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Customer } from '../db/schema';
import { customersRepo, ordersRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { customerHistory } from '../lib/customers';
import { formatDay } from '../lib/dates';
import { formatShekels } from '../lib/money';
import { toWhatsAppNumber, whatsAppLink } from '../lib/phone';
import { href } from '../lib/route';
import { PaymentBadge, StatusBadge } from '../ui/badges';
import { returnTo } from '../ui/router';

export function CustomerDetailScreen({ id }: { id: string }) {
  // null = looked and not found; undefined = still loading.
  const customer = useLiveQuery(async () => (await customersRepo.get(id)) ?? null, [id]);
  const orders = useLiveQuery(() => ordersRepo.byCustomer(id), [id]);
  const [message, setMessage] = useState('');

  if (customer === undefined || orders === undefined) return null;
  if (customer === null) {
    return (
      <section>
        <p>{he.customers.notFound}</p>
        <a href={href({ name: 'customers' })}>{he.customers.backToList}</a>
      </section>
    );
  }

  const history = customerHistory(orders);
  const number = toWhatsAppNumber(customer.phone);

  // Refused before asking, when the orders on screen already say so; the repository
  // checks again inside its transaction.
  async function onDelete() {
    if (history.orders.length > 0) return setMessage(he.customers.deleteRefused);
    if (!confirm(he.customers.deleteConfirm)) return;
    if (await customersRepo.deleteIfNoOrders(id)) returnTo({ name: 'customers' });
    else setMessage(he.customers.deleteRefused);
  }

  return (
    <section class="detail">
      <div class="detail-head">
        <h2>{customer.name}</h2>
        <a class="button secondary" href={href({ name: 'customerEdit', id })}>{he.customers.edit}</a>
      </div>

      {customer.phone && (
        <>
          <p class="muted" dir="ltr">{customer.phone}</p>
          <div class="row contact-actions">
            <a class="button" href={`tel:${customer.phone.replace(/[^\d+]/g, '')}`}>{he.customers.call}</a>
            {number && (
              <a class="button whatsapp-button" href={whatsAppLink(number, '')} target="_blank" rel="noopener">
                {he.customers.whatsapp}
              </a>
            )}
          </div>
        </>
      )}

      <h3>{he.customers.notes}</h3>
      <NotesEditor key={customer.id} customer={customer} />

      <h3>{he.customers.history}</h3>
      <dl class="facts">
        <dt>{he.customers.orderCount}</dt>
        <dd>{history.orders.length}</dd>
        <dt>{he.customers.totalPaid}</dt>
        <dd>{formatShekels(history.totalPaid)}</dd>
      </dl>
      {history.orders.length === 0 && <p class="muted">{he.customers.noOrders}</p>}
      <ul class="cards">
        {history.orders.map((order) => (
          <li key={order.id}>
            <a class={`card status-${order.status}`} href={href({ name: 'order', id: order.id })}>
              <div class="card-top">
                <span>{formatDay(order.deliveryDate)}</span>
                <span>{formatShekels(order.total)}</span>
              </div>
              <div class="card-bottom">
                <span>{order.items[0]?.name}</span>
                <span class="badges">
                  <StatusBadge status={order.status} />
                  <PaymentBadge order={order} />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {message && <p class="message" role="status">{message}</p>}
      <div class="row bottom-row">
        <button type="button" class="secondary" onClick={() => void onDelete()}>{he.customers.delete}</button>
        <button type="button" class="secondary leave" onClick={() => returnTo({ name: 'customers' }, 'push')}>
          → {he.customers.backToList}
        </button>
      </div>
    </section>
  );
}

// Notes are edited in place, saved as she types, like the business name in settings:
// "the things worth remembering" should not need a separate edit screen.
function NotesEditor({ customer }: { customer: Customer }) {
  const [value, setValue] = useState(customer.notes);
  return (
    <textarea
      rows={3}
      value={value}
      placeholder={he.customers.notesPlaceholder}
      onInput={(e) => {
        const notes = e.currentTarget.value;
        setValue(notes);
        void customersRepo.updateNotes(customer.id, notes);
      }}
    />
  );
}
