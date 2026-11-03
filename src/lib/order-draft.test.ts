import { describe, expect, it } from 'vitest';
import type { Order } from '../db/schema';
import { draftFromOrder, draftTotal, emptyDraft, emptyLine, lineSuggestions, orderFromDraft, setLineName, validateDraft, type OrderDraft } from './order-draft';

// Her notebook line: "דנה לוי- עוגת פרחים, 4 שכבות, שוקולד +שוקולד- פרווה".
function notebookDraft(): OrderDraft {
  return {
    ...emptyDraft(),
    customer: { kind: 'new', name: ' דנה לוי ', phone: '050-1234567' },
    lines: [{ name: 'עוגת פרחים', qty: '1', unitPrice: '320', details: '4 שכבות, שוקולד + שוקולד, פרווה' }, emptyLine()],
    deliveryDate: '2026-11-19',
    eventDate: '2026-11-20',
    guests: '30',
  };
}

const ids = { id: 'o1', customerId: 'c1' };
const now = '2026-11-02T12:00:00.000Z';

describe('validateDraft', () => {
  it('accepts her notebook example and ignores the empty spare line', () => {
    expect(validateDraft(notebookDraft())).toEqual([]);
  });

  it('needs a customer, a named line and a delivery date', () => {
    expect(validateDraft(emptyDraft())).toEqual(['customer', 'lines', 'deliveryDate']);
  });

  it('allows a line with no price yet', () => {
    const d = notebookDraft();
    d.lines[0]!.unitPrice = '';
    expect(validateDraft(d)).toEqual([]);
  });

  it('refuses a price that is not a number, or negative', () => {
    const d = notebookDraft();
    d.lines[0]!.unitPrice = 'abc';
    expect(validateDraft(d)).toEqual(['price']);
    d.lines[0]!.unitPrice = '-5';
    expect(validateDraft(d)).toEqual(['price']);
  });

  it('refuses a quantity or guests that is not a whole positive number', () => {
    const d = notebookDraft();
    d.lines[0]!.qty = '1.5';
    d.guests = 'thirty';
    expect(validateDraft(d)).toEqual(['qty', 'guests']);
  });

  it('refuses a line with details or a price but no product name', () => {
    const d = notebookDraft();
    d.lines[1] = { ...emptyLine(), details: 'ורוד' };
    expect(validateDraft(d)).toEqual(['lines']);
  });

  it('needs a deposit amount once "add deposit" is open', () => {
    const d = { ...notebookDraft(), hasDeposit: true };
    expect(validateDraft(d)).toEqual(['deposit']);
    expect(validateDraft({ ...d, deposit: '100' })).toEqual([]);
  });
});

describe('draftTotal', () => {
  it('follows the lines as she types, counting unreadable fields as zero', () => {
    const d = notebookDraft();
    d.lines[1] = { name: 'קאפקייקס', qty: '12', unitPrice: '8', details: '' };
    expect(draftTotal(d)).toBe(32000 + 9600);
    d.lines[1]!.qty = '';
    expect(draftTotal(d)).toBe(32000);
  });
});

describe('orderFromDraft', () => {
  it('builds a new order: trimmed, titled by the customer, status new, nothing paid', () => {
    const order = orderFromDraft(notebookDraft(), ids, now);
    expect(order).toEqual({
      id: 'o1',
      customerId: 'c1',
      title: 'דנה לוי',
      items: [{ name: 'עוגת פרחים', qty: 1, unitPrice: 32000, details: '4 שכבות, שוקולד + שוקולד, פרווה' }],
      deliveryDate: '2026-11-19',
      eventDate: '2026-11-20',
      guests: 30,
      fulfilment: 'pickup',
      designNotes: '',
      notes: '',
      status: 'new',
      total: 32000,
      paidAmount: 0,
      createdAt: now,
      updatedAt: now,
    });
  });

  it('keeps the address only for delivery', () => {
    const d = { ...notebookDraft(), address: 'הרצל 1' };
    expect(orderFromDraft(d, ids, now).address).toBeUndefined();
    expect(orderFromDraft({ ...d, fulfilment: 'delivery' }, ids, now).address).toBe('הרצל 1');
  });

  it('records a deposit with its date and method', () => {
    const d = { ...notebookDraft(), hasDeposit: true, deposit: '100', depositPaidAt: '2026-11-02', depositMethod: 'bit' as const };
    const order = orderFromDraft(d, ids, now);
    expect([order.deposit, order.depositPaidAt, order.depositMethod]).toEqual([10000, '2026-11-02', 'bit']);
  });

  it('on edit keeps status, the final payment and createdAt, and recomputes the total', () => {
    const existing: Order = {
      ...orderFromDraft(notebookDraft(), ids, '2026-11-01T00:00:00.000Z'),
      status: 'delivered',
      paidAmount: 32000,
      paidAt: '2026-11-19',
      paidMethod: 'cash',
    };
    const d = draftFromOrder(existing, 'דנה לוי');
    d.lines[0]!.qty = '2';
    const edited = orderFromDraft(d, ids, now, existing);
    expect(edited.status).toBe('delivered');
    expect([edited.paidAmount, edited.paidAt, edited.paidMethod]).toEqual([32000, '2026-11-19', 'cash']);
    expect(edited.createdAt).toBe('2026-11-01T00:00:00.000Z');
    expect(edited.updatedAt).toBe(now);
    expect(edited.total).toBe(64000);
  });
});

describe('draftFromOrder', () => {
  it('round-trips through orderFromDraft unchanged', () => {
    const d = { ...notebookDraft(), hasDeposit: true, deposit: '120.5', depositPaidAt: '2026-11-02', depositMethod: 'paybox' as const, fulfilment: 'delivery' as const, address: 'הרצל 1', designNotes: 'פרחים ורודים', notes: 'בלי אגוזים' };
    const order = orderFromDraft(d, ids, now);
    expect(orderFromDraft(draftFromOrder(order, 'דנה לוי'), ids, now, order)).toEqual(order);
  });
});

describe('lineSuggestions', () => {
  const products = [
    { id: 'p1', name: 'עוגת פרחים', price: 32000, active: true },
    { id: 'p2', name: 'עוגה ישנה', price: 10000, active: false },
  ];
  const line = (name: string, unitPrice: number) => ({ name, qty: 1, unitPrice, details: '' });
  const orders = [
    { createdAt: '2026-10-01T00:00:00Z', items: [line('מגש קאפקייקס', 15000), line('עוגת פרחים', 30000)] },
    { createdAt: '2026-10-20T00:00:00Z', items: [line('מגש קאפקייקס', 18000), line('עוגת גבינה', 0)] },
  ];

  it('offers the active catalogue first, then past names at their most recent price', () => {
    expect(lineSuggestions(products, orders)).toEqual([
      { name: 'עוגת פרחים', unitPrice: 32000, productId: 'p1' },
      { name: 'מגש קאפקייקס', unitPrice: 18000 },
      { name: 'עוגת גבינה' },
    ]);
  });

  it('works with an empty catalogue, which is how it ships', () => {
    expect(lineSuggestions([], orders).map((s) => s.name)).toEqual(['מגש קאפקייקס', 'עוגת גבינה', 'עוגת פרחים']);
  });
});

describe('setLineName', () => {
  const suggestions = [
    { name: 'עוגת פרחים', unitPrice: 32000, productId: 'p1' },
    { name: 'מגש קאפקייקס', unitPrice: 18000 },
  ];

  it('fills the price of a past-order name and links a catalogue product', () => {
    const past = setLineName(emptyLine(), 'מגש קאפקייקס', suggestions);
    expect([past.unitPrice, past.productId]).toEqual(['180', undefined]);
    const catalogue = setLineName(emptyLine(), 'עוגת פרחים', suggestions);
    expect([catalogue.unitPrice, catalogue.productId]).toEqual(['320', 'p1']);
  });

  it('replaces a suggested price when she switches to another suggestion', () => {
    const first = setLineName(emptyLine(), 'עוגת פרחים', suggestions);
    const second = setLineName(first, 'מגש קאפקייקס', suggestions);
    expect([second.unitPrice, second.productId]).toEqual(['180', undefined]);
  });

  it('never overwrites a price she typed herself', () => {
    const typed = { ...emptyLine(), unitPrice: '250' };
    expect(setLineName(typed, 'עוגת פרחים', suggestions).unitPrice).toBe('250');
    const picked = { ...setLineName(emptyLine(), 'עוגת פרחים', suggestions), unitPrice: '300', priceFromSuggestion: false };
    expect(setLineName(picked, 'מגש קאפקייקס', suggestions).unitPrice).toBe('300');
  });

  it('fills the longer name when one suggestion is the start of another', () => {
    const both = [{ name: 'מגש', unitPrice: 10000 }, { name: 'מגש קאפקייקס', unitPrice: 18000 }];
    let line = setLineName(emptyLine(), 'מגש', both);
    expect(line.unitPrice).toBe('100');
    line = setLineName(line, 'מגש ק', both);
    line = setLineName(line, 'מגש קאפקייקס', both);
    expect(line.unitPrice).toBe('180');
  });

  it('keeps the price but drops the product link when she types past a suggestion', () => {
    const picked = setLineName(emptyLine(), 'עוגת פרחים', suggestions);
    const typedOn = setLineName(picked, 'עוגת פרחים גדולה', suggestions);
    expect([typedOn.unitPrice, 'productId' in typedOn]).toEqual(['320', false]);
  });
});
