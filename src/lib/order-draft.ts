import type { Order, PaymentMethod } from '../db/schema';
import { agorotToInput, parseShekels, type Agorot } from './money';
import { orderTotal } from './orders';

// The order form edits text, not an Order: "120.5" in a price field, "" in guests.
// Turning that text into a valid Order is the part worth testing, so it lives here.

export interface LineDraft {
  productId?: string;
  name: string;
  qty: string;
  unitPrice: string;
  details: string;
}

export type CustomerChoice =
  | { kind: 'existing'; id: string; name: string }
  | { kind: 'new'; name: string; phone: string };

export interface OrderDraft {
  customer: CustomerChoice | null;
  lines: LineDraft[];
  deliveryDate: string;
  fulfilment: 'pickup' | 'delivery';
  address: string;
  eventDate: string;
  guests: string;
  designNotes: string;
  notes: string;
  hasDeposit: boolean;
  deposit: string;
  depositPaidAt: string;
  depositMethod: PaymentMethod | '';
}

export type DraftError = 'customer' | 'lines' | 'qty' | 'price' | 'deliveryDate' | 'guests' | 'deposit';

export const emptyLine = (): LineDraft => ({ name: '', qty: '1', unitPrice: '', details: '' });

export function emptyDraft(): OrderDraft {
  return {
    customer: null,
    lines: [emptyLine()],
    deliveryDate: '',
    fulfilment: 'pickup',
    address: '',
    eventDate: '',
    guests: '',
    designNotes: '',
    notes: '',
    hasDeposit: false,
    deposit: '',
    depositPaidAt: '',
    depositMethod: '',
  };
}

export function draftFromOrder(order: Order, customerName: string): OrderDraft {
  return {
    customer: { kind: 'existing', id: order.customerId, name: customerName },
    lines: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      qty: String(item.qty),
      unitPrice: agorotToInput(item.unitPrice),
      details: item.details,
    })),
    deliveryDate: order.deliveryDate,
    fulfilment: order.fulfilment,
    address: order.address ?? '',
    eventDate: order.eventDate ?? '',
    guests: order.guests === undefined ? '' : String(order.guests),
    designNotes: order.designNotes,
    notes: order.notes,
    hasDeposit: order.deposit !== undefined,
    deposit: order.deposit === undefined ? '' : agorotToInput(order.deposit),
    depositPaidAt: order.depositPaidAt ?? '',
    depositMethod: order.depositMethod ?? '',
  };
}

/** A line she left completely empty is ignored, not an error. */
function isBlank(line: LineDraft): boolean {
  return line.name.trim() === '' && line.unitPrice.trim() === '' && line.details.trim() === '';
}

function parseQty(text: string): number | null {
  const n = Number(text.trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Live total while she types: unreadable fields count as nothing rather than blocking. */
export function draftTotal(draft: OrderDraft): Agorot {
  return orderTotal(
    draft.lines.map((line) => ({
      qty: parseQty(line.qty) ?? 0,
      unitPrice: parseShekels(line.unitPrice) ?? 0,
    })),
  );
}

export function validateDraft(draft: OrderDraft): DraftError[] {
  const errors: DraftError[] = [];
  const c = draft.customer;
  if (!c || c.name.trim() === '') errors.push('customer');

  const lines = draft.lines.filter((l) => !isBlank(l));
  if (lines.length === 0 || lines.some((l) => l.name.trim() === '')) errors.push('lines');
  if (lines.some((l) => parseQty(l.qty) === null)) errors.push('qty');
  // An empty price is allowed (price agreed later); a price that is not a number is not.
  if (lines.some((l) => l.unitPrice.trim() !== '' && !nonNegative(parseShekels(l.unitPrice)))) {
    errors.push('price');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.deliveryDate)) errors.push('deliveryDate');
  if (draft.guests.trim() !== '' && parseQty(draft.guests) === null) errors.push('guests');
  if (draft.hasDeposit && !nonNegative(parseShekels(draft.deposit))) errors.push('deposit');
  return errors;
}

function nonNegative(a: Agorot | null): a is Agorot {
  return a !== null && a >= 0;
}

/**
 * Builds the Order to save. Call only when validateDraft returned no errors.
 * On edit, `existing` keeps what the form does not touch: status, final payment, createdAt.
 */
export function orderFromDraft(
  draft: OrderDraft,
  ids: { id: string; customerId: string },
  now: string,
  existing?: Order,
): Order {
  const items = draft.lines
    .filter((l) => !isBlank(l))
    .map((l) => ({
      ...(l.productId ? { productId: l.productId } : {}),
      name: l.name.trim(),
      qty: parseQty(l.qty)!,
      unitPrice: parseShekels(l.unitPrice) ?? 0,
      details: l.details.trim(),
    }));

  const order: Order = {
    id: ids.id,
    customerId: ids.customerId,
    title: draft.customer!.name.trim(),
    items,
    deliveryDate: draft.deliveryDate,
    fulfilment: draft.fulfilment,
    designNotes: draft.designNotes.trim(),
    notes: draft.notes.trim(),
    status: existing?.status ?? 'new',
    total: orderTotal(items),
    paidAmount: existing?.paidAmount ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (draft.fulfilment === 'delivery' && draft.address.trim()) order.address = draft.address.trim();
  if (draft.eventDate) order.eventDate = draft.eventDate;
  if (draft.guests.trim()) order.guests = parseQty(draft.guests)!;
  if (existing?.paidAt) {
    order.paidAt = existing.paidAt;
    if (existing.paidMethod) order.paidMethod = existing.paidMethod;
  }
  if (draft.hasDeposit) {
    order.deposit = parseShekels(draft.deposit)!;
    if (draft.depositPaidAt) order.depositPaidAt = draft.depositPaidAt;
    if (draft.depositMethod) order.depositMethod = draft.depositMethod;
  }
  return order;
}
