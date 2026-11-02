import { useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Order, OrderStatus, PaymentMethod } from '../db/schema';
import { customersRepo, ordersRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { formatDay, localIsoDate } from '../lib/dates';
import { agorotToInput, formatShekels, parseShekels } from '../lib/money';
import { clearPayment, lineTotal, nextStatuses, outstanding, paidSoFar, recordPayment } from '../lib/orders';
import { href } from '../lib/route';
import { PaymentBadge, StatusBadge } from '../ui/badges';

const methods: PaymentMethod[] = ['cash', 'bit', 'paybox', 'transfer', 'other'];

export function OrderDetailScreen({ id }: { id: string }) {
  // null = looked and not found; undefined = still loading.
  const order = useLiveQuery(async () => (await ordersRepo.get(id)) ?? null, [id]);
  const customer = useLiveQuery(
    async () => (order ? ((await customersRepo.get(order.customerId)) ?? null) : null),
    [order?.customerId],
  );

  if (order === undefined) return null;
  if (order === null) {
    return (
      <section>
        <p>{he.orders.notFound}</p>
        <a href={href({ name: 'orders' })}>{he.orders.backToList}</a>
      </section>
    );
  }

  async function setStatus(status: OrderStatus) {
    if (status === 'cancelled' && !confirm(he.orderDetail.cancelConfirm)) return;
    await ordersRepo.put({ ...order!, status, updatedAt: new Date().toISOString() });
  }

  return (
    <section class="detail">
      <div class="detail-head">
        <h2>{order.title}</h2>
        <a class="button secondary" href={href({ name: 'orderEdit', id: order.id })}>{he.orderDetail.edit}</a>
      </div>
      {customer?.phone && <p class="muted" dir="ltr">{customer.phone}</p>}
      <p class="badges">
        <StatusBadge status={order.status} />
        <PaymentBadge order={order} />
      </p>

      <ul class="lines">
        {order.items.map((item, i) => (
          <li key={i}>
            <div class="card-top">
              <span>{item.qty > 1 && `${item.qty} × `}{item.name}</span>
              <span>{formatShekels(lineTotal(item))}</span>
            </div>
            {item.details && <p class="muted">{item.details}</p>}
          </li>
        ))}
      </ul>

      <dl class="facts">
        <dt>{he.orderDetail.delivery}</dt>
        <dd>
          {formatDay(order.deliveryDate)} ·{' '}
          {order.fulfilment === 'pickup' ? he.orderDetail.fulfilmentPickup : he.orderDetail.fulfilmentDelivery}
          {order.address && ` · ${order.address}`}
        </dd>
        {(order.eventDate || order.guests !== undefined) && (
          <>
            <dt>{he.orderDetail.event}</dt>
            <dd>
              {order.eventDate && formatDay(order.eventDate)}
              {order.eventDate && order.guests !== undefined && ' · '}
              {order.guests !== undefined && `${order.guests} ${he.orderDetail.guestsSuffix}`}
            </dd>
          </>
        )}
        {order.designNotes && (
          <>
            <dt>{he.orderForm.designNotes}</dt>
            <dd>{order.designNotes}</dd>
          </>
        )}
        {order.notes && (
          <>
            <dt>{he.orderForm.notes}</dt>
            <dd>{order.notes}</dd>
          </>
        )}
      </dl>

      <h3>{he.orderDetail.status}</h3>
      <div class="row">
        {nextStatuses(order.status).map((s) => (
          <button type="button" key={s} class={s === 'cancelled' ? 'secondary' : ''} onClick={() => void setStatus(s)}>
            {he.toStatus[s]}
          </button>
        ))}
      </div>

      <h3>{he.orderDetail.payment}</h3>
      <PaymentSection order={order} />
    </section>
  );
}

function PaymentSection({ order }: { order: Order }) {
  const [editing, setEditing] = useState(false);
  const owed = outstanding(order);

  return (
    <div>
      <dl class="facts">
        <dt>{he.orderDetail.total}</dt>
        <dd>{formatShekels(order.total)}</dd>
        {order.deposit !== undefined && (
          <>
            <dt>{order.depositPaidAt ? he.orderDetail.depositPaid : he.orderDetail.depositUnpaid}</dt>
            <dd>
              {formatShekels(order.deposit)}
              {order.depositPaidAt && ` · ${formatDay(order.depositPaidAt)}`}
              {order.depositMethod && ` · ${he.method[order.depositMethod]}`}
            </dd>
          </>
        )}
        {order.paidAt && (
          <>
            <dt>{he.orderDetail.finalPayment}</dt>
            <dd>
              {formatShekels(order.paidAmount)} · {formatDay(order.paidAt)}
              {order.paidMethod && ` · ${he.method[order.paidMethod]}`}
            </dd>
          </>
        )}
        <dt>{he.orderDetail.paidSoFar}</dt>
        <dd>{formatShekels(paidSoFar(order))}</dd>
        <dt>{he.orderDetail.outstanding}</dt>
        <dd><strong>{formatShekels(Math.max(owed, 0))}</strong></dd>
      </dl>

      {editing ? (
        <PaymentForm order={order} onDone={() => setEditing(false)} />
      ) : (
        <div class="row">
          <button type="button" onClick={() => setEditing(true)}>
            {order.paidAt ? he.orderDetail.editPayment : he.orderDetail.markPaid}
          </button>
          {order.paidAt && (
            <button
              type="button"
              class="secondary"
              onClick={() => void ordersRepo.put(clearPayment(order, new Date().toISOString()))}
            >
              {he.orderDetail.removePayment}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Prefilled so the usual case is one more tap: the amount still owed, today, and the
// method she used last time on this order.
function PaymentForm({ order, onDone }: { order: Order; onDone: () => void }) {
  const initialAmount = order.paidAt ? order.paidAmount : Math.max(outstanding(order), 0);
  const [amount, setAmount] = useState(agorotToInput(initialAmount));
  const [method, setMethod] = useState<PaymentMethod | undefined>(order.paidMethod);
  const [date, setDate] = useState(order.paidAt ?? localIsoDate(new Date()));
  const [error, setError] = useState(false);

  async function save() {
    const parsed = parseShekels(amount);
    // Zero is not a payment; "cancel payment" is how she undoes one.
    if (parsed === null || parsed <= 0 || !date) return setError(true);
    await ordersRepo.put(recordPayment(order, { amount: parsed, date, method }, new Date().toISOString()));
    onDone();
  }

  return (
    <div class="subform">
      <div class="two">
        <label class="field">
          <span>{he.orderDetail.amount}</span>
          <input type="text" inputMode="decimal" value={amount} onInput={(e) => setAmount(e.currentTarget.value)} />
        </label>
        <label class="field">
          <span>{he.orderDetail.date}</span>
          <input type="date" value={date} onInput={(e) => setDate(e.currentTarget.value)} />
        </label>
      </div>
      <div class="field">
        <span>{he.orderDetail.method}</span>
        <div class="segmented wrap">
          {methods.map((m) => (
            <button type="button" key={m} class={method === m ? 'on' : ''} onClick={() => setMethod(m)}>
              {he.method[m]}
            </button>
          ))}
        </div>
      </div>
      {error && <p class="errors" role="alert">{he.orderDetail.amountError}</p>}
      <div class="row">
        <button type="button" onClick={() => void save()}>{he.orderDetail.savePayment}</button>
        <button type="button" class="secondary" onClick={onDone}>{he.orderForm.cancel}</button>
      </div>
    </div>
  );
}
