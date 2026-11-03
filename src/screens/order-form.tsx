import { useEffect, useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Customer, PaymentMethod } from '../db/schema';
import { customersRepo, ordersRepo, productsRepo } from '../db/repositories';
import { he } from '../i18n/he';
import { localIsoDate } from '../lib/dates';
import { agorotToInput, formatShekels } from '../lib/money';
import {
  draftFromOrder,
  draftTotal,
  emptyDraft,
  emptyLine,
  lineSuggestions,
  orderFromDraft,
  setLineName,
  validateDraft,
  type DraftError,
  type LineDraft,
  type LineSuggestion,
  type OrderDraft,
} from '../lib/order-draft';
import { CustomerPicker } from '../ui/customer-picker';
import { selectAll } from '../ui/inputs';
import { navigate, returnTo } from '../ui/router';

const methods: PaymentMethod[] = ['cash', 'bit', 'paybox', 'transfer', 'other'];

/** New order when `id` is absent; otherwise edits that order. */
export function OrderFormScreen({ id }: { id?: string }) {
  const [draft, setDraft] = useState<OrderDraft | null>(id ? null : emptyDraft());
  const [errors, setErrors] = useState<DraftError[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const products = useLiveQuery(() => productsRepo.all(), [], []);
  const pastOrders = useLiveQuery(() => ordersRepo.all(), [], []);
  const suggestions = lineSuggestions(products, pastOrders);

  // Editing: load the order once into a draft; later database changes do not overwrite her typing.
  useEffect(() => {
    if (!id) return;
    void (async () => {
      const order = await ordersRepo.get(id);
      if (!order) return navigate({ name: 'orders' }, { replace: true });
      const customer = await customersRepo.get(order.customerId);
      setDraft(draftFromOrder(order, customer?.name ?? order.title));
    })();
  }, [id]);

  if (!draft) return null;
  const set = (changes: Partial<OrderDraft>) => setDraft({ ...draft, ...changes });
  const setLine = (index: number, line: LineDraft) =>
    set({ lines: draft.lines.map((l, i) => (i === index ? line : l)) });

  async function save() {
    // A second tap while the first save is running would create a second order.
    if (saving) return;
    const found = validateDraft(draft!);
    setErrors(found);
    setSaveFailed(false);
    if (found.length > 0) return;

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const c = draft!.customer!;
      const newCustomer: Customer | undefined =
        c.kind === 'new'
          ? { id: crypto.randomUUID(), name: c.name.trim(), phone: c.phone.trim(), notes: '', createdAt: now }
          : undefined;
      const customerId = c.kind === 'existing' ? c.id : newCustomer!.id;
      const existing = id ? await ordersRepo.get(id) : undefined;
      const order = orderFromDraft(draft!, { id: id ?? crypto.randomUUID(), customerId }, now, existing);
      await ordersRepo.saveWithCustomer(order, newCustomer);
      // A new order goes back to the list, where she sees it among the others and the
      // next one starts from the same button; an edit goes back to the order it edited.
      returnTo(id ? { name: 'order', id } : { name: 'orders' });
    } catch {
      setSaveFailed(true);
      setSaving(false);
    }
  }

  return (
    <section class="form">
      <h2>{id ? he.orderForm.editTitle : he.orderForm.newTitle}</h2>

      <div class="field">
        <span>{he.orderForm.customer}</span>
        <CustomerPicker value={draft.customer} onChange={(customer) => set({ customer })} />
      </div>

      <h3>{he.orderForm.lines}</h3>
      <datalist id="product-names">
        {suggestions.map((s) => <option key={s.name} value={s.name} />)}
      </datalist>
      {draft.lines.map((line, i) => (
        <LineEditor
          key={i}
          line={line}
          suggestions={suggestions}
          onChange={(next) => setLine(i, next)}
          onRemove={draft.lines.length > 1 ? () => set({ lines: draft.lines.filter((_, j) => j !== i) }) : undefined}
        />
      ))}
      <button type="button" class="secondary" onClick={() => set({ lines: [...draft.lines, emptyLine()] })}>
        + {he.orderForm.addLine}
      </button>
      <p class="total">{he.orderForm.total}: <strong>{formatShekels(draftTotal(draft))}</strong></p>

      <label class="field">
        <span>{he.orderForm.deliveryDate}</span>
        <input type="date" value={draft.deliveryDate} onInput={(e) => set({ deliveryDate: e.currentTarget.value })} />
      </label>

      <div class="field">
        <span>{he.orderForm.fulfilment}</span>
        <div class="segmented">
          {(['pickup', 'delivery'] as const).map((f) => (
            <button type="button" key={f} class={draft.fulfilment === f ? 'on' : ''} onClick={() => set({ fulfilment: f })}>
              {he.orderForm[f]}
            </button>
          ))}
        </div>
      </div>
      {draft.fulfilment === 'delivery' && (
        <label class="field">
          <span>{he.orderForm.address}</span>
          <input type="text" value={draft.address} onInput={(e) => set({ address: e.currentTarget.value })} />
        </label>
      )}

      <div class="two">
        <label class="field">
          <span>{he.orderForm.eventDate}</span>
          <input type="date" value={draft.eventDate} onInput={(e) => set({ eventDate: e.currentTarget.value })} />
        </label>
        <label class="field">
          <span>{he.orderForm.guests}</span>
          <input type="text" inputMode="numeric" value={draft.guests} onFocus={selectAll} onInput={(e) => set({ guests: e.currentTarget.value })} />
        </label>
      </div>

      <label class="field">
        <span>{he.orderForm.designNotes}</span>
        <textarea rows={2} value={draft.designNotes} onInput={(e) => set({ designNotes: e.currentTarget.value })} />
      </label>
      <label class="field">
        <span>{he.orderForm.notes}</span>
        <textarea rows={2} value={draft.notes} onInput={(e) => set({ notes: e.currentTarget.value })} />
      </label>

      {draft.hasDeposit ? (
        <DepositEditor draft={draft} set={set} />
      ) : (
        <button type="button" class="secondary" onClick={() => set({ hasDeposit: true, depositPaidAt: localIsoDate(new Date()) })}>+ {he.orderForm.addDeposit}</button>
      )}

      {errors.length > 0 && (
        <ul class="errors" role="alert">
          {errors.map((e) => <li key={e}>{he.orderForm.errors[e]}</li>)}
        </ul>
      )}

      {saveFailed && <p class="errors" role="alert">{he.orderForm.saveFailed}</p>}

      <div class="actions">
        <button type="button" disabled={saving} onClick={() => void save()}>{he.orderForm.save}</button>
        <button type="button" class="secondary" onClick={() => history.back()}>{he.orderForm.cancel}</button>
      </div>
    </section>
  );
}

function LineEditor({
  line,
  suggestions,
  onChange,
  onRemove,
}: {
  line: LineDraft;
  suggestions: LineSuggestion[];
  onChange: (line: LineDraft) => void;
  onRemove?: () => void;
}) {
  return (
    <div class="line">
      <label class="field">
        <span>{he.orderForm.product}</span>
        <input
          type="text"
          list="product-names"
          value={line.name}
          placeholder={he.orderForm.productPlaceholder}
          onInput={(e) => onChange(setLineName(line, e.currentTarget.value, suggestions))}
        />
      </label>
      <div class="two">
        <label class="field">
          <span>{he.orderForm.qty}</span>
          <input type="text" inputMode="numeric" value={line.qty} onFocus={selectAll} onInput={(e) => onChange({ ...line, qty: e.currentTarget.value })} />
        </label>
        <label class="field">
          <span>{he.orderForm.unitPrice}</span>
          <input type="text" inputMode="decimal" value={line.unitPrice} onFocus={selectAll} onInput={(e) => onChange({ ...line, unitPrice: e.currentTarget.value, priceFromSuggestion: false })} />
        </label>
      </div>
      <label class="field">
        <span>{he.orderForm.details}</span>
        <input
          type="text"
          value={line.details}
          placeholder={he.orderForm.detailsPlaceholder}
          onInput={(e) => onChange({ ...line, details: e.currentTarget.value })}
        />
      </label>
      {onRemove && (
        <button type="button" class="link" onClick={onRemove}>{he.orderForm.removeLine}</button>
      )}
    </div>
  );
}

function DepositEditor({ draft, set }: { draft: OrderDraft; set: (c: Partial<OrderDraft>) => void }) {
  return (
    <div class="subform">
      <h3>{he.orderForm.deposit}</h3>
      {/* Paid up front in full is a deposit of the whole total: one tap, not typing the sum. */}
      <div class="deposit-amount">
        <label class="field">
          <span>{he.orderForm.depositAmount}</span>
          <input
            type="text"
            inputMode="decimal"
            value={draft.deposit}
            onFocus={selectAll}
            onInput={(e) => set({ deposit: e.currentTarget.value })}
          />
        </label>
        <button type="button" class="secondary" onClick={() => set({ deposit: agorotToInput(draftTotal(draft)) })}>
          {he.orderForm.fullAmount}
        </button>
      </div>
      <label class="field">
        <span>{he.orderForm.depositPaidAt}</span>
        <input type="date" value={draft.depositPaidAt} onInput={(e) => set({ depositPaidAt: e.currentTarget.value })} />
      </label>
      <label class="field">
        <span>{he.orderForm.depositMethod}</span>
        <select
          value={draft.depositMethod}
          onChange={(e) => set({ depositMethod: e.currentTarget.value as PaymentMethod | '' })}
        >
          <option value="">{he.orderForm.methodNone}</option>
          {methods.map((m) => <option key={m} value={m}>{he.method[m]}</option>)}
        </select>
      </label>
      <button
        type="button"
        class="link"
        onClick={() => set({ hasDeposit: false, deposit: '', depositPaidAt: '', depositMethod: '' })}
      >
        {he.orderForm.removeDeposit}
      </button>
    </div>
  );
}
