import { describe, expect, it } from 'vitest';
import {
  backupFileName,
  base64ToBytes,
  bytesToBase64,
  parseBackup,
  serialiseBackup,
  type Backup,
} from './backup';

const sample: Pick<Backup, 'settings' | 'products' | 'customers' | 'orders' | 'ingredients'> = {
  settings: {
    id: 'me',
    businessName: 'העוגות של נועה',
    templates: { accepted: 'שלום {name}' },
    logo: { type: 'image/png', base64: 'iVBORw0K' },
    lastBackupAt: '2026-11-01T10:00:00.000Z',
    schemaVersion: 1,
  },
  products: [
    {
      id: 'p1', name: 'עוגת פרחים', price: 32000, active: true, createdAt: '2026-11-01T09:00:00.000Z',
      parts: [{ name: 'בצק', lines: [{ ingredientId: 'i1', qty: 0.5 }] }],
    },
  ],
  ingredients: [
    { id: 'i1', name: 'קמח', unit: 'g', packQty: 1000, packPrice: 600, createdAt: '2026-11-01T09:00:00.000Z' },
  ],
  customers: [
    { id: 'c1', name: 'דנה לוי', phone: '050-1234567', notes: '', createdAt: '2026-11-01T09:00:00.000Z' },
  ],
  orders: [
    {
      id: 'o1',
      customerId: 'c1',
      title: 'דנה לוי',
      items: [{ productId: 'p1', name: 'עוגת פרחים', qty: 1, unitPrice: 32000, unitCost: 960, details: '4 שכבות, שוקולד, פרווה' }],
      guests: 30,
      eventDate: '2026-11-20',
      deliveryDate: '2026-11-19',
      fulfilment: 'pickup',
      designNotes: 'פרחים ורודים',
      status: 'confirmed',
      total: 32000,
      paidAmount: 0,
      deposit: 10000,
      depositPaidAt: '2026-11-02',
      depositMethod: 'bit',
      notes: '',
      createdAt: '2026-11-01T09:00:00.000Z',
      updatedAt: '2026-11-01T09:00:00.000Z',
    },
  ],
};

const text = serialiseBackup(sample, '2026-11-02T12:00:00.000Z');

function withChange(change: (b: Record<string, any>) => void): string {
  const b = JSON.parse(text);
  change(b);
  return JSON.stringify(b);
}

describe('serialiseBackup / parseBackup', () => {
  it('round-trips every table and the logo', () => {
    const result = parseBackup(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.backup.schemaVersion).toBe(2);
    expect(result.backup.exportedAt).toBe('2026-11-02T12:00:00.000Z');
    expect(result.backup.settings).toEqual(sample.settings);
    expect(result.backup.orders).toEqual(sample.orders);
    expect(result.backup.customers).toEqual(sample.customers);
    expect(result.backup.products).toEqual(sample.products);
    expect(result.backup.ingredients).toEqual(sample.ingredients);
  });

  it('restores a version 1 file, which has no ingredients', () => {
    const v1 = withChange((b) => {
      b.schemaVersion = 1;
      delete b.ingredients;
      delete b.products[0].parts;
      delete b.orders[0].items[0].unitCost;
    });
    const result = parseBackup(v1);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.backup.ingredients).toEqual([]);
  });

  it('accepts empty tables and no logo', () => {
    const empty = serialiseBackup(
      { settings: { id: 'me', businessName: '', templates: {}, schemaVersion: 2 }, products: [], customers: [], orders: [], ingredients: [] },
      '2026-11-02T12:00:00.000Z',
    );
    expect(parseBackup(empty).ok).toBe(true);
  });

  it('refuses text that is not JSON', () => {
    expect(parseBackup('not a backup')).toEqual({ ok: false, error: 'notJson' });
  });

  it('refuses JSON from something else', () => {
    expect(parseBackup('{"hello":1}')).toEqual({ ok: false, error: 'notSweetSpot' });
    expect(parseBackup('[1,2]')).toEqual({ ok: false, error: 'notSweetSpot' });
  });

  it('refuses a file from a newer version of the app', () => {
    expect(parseBackup(withChange((b) => { b.schemaVersion = 3; }))).toEqual({ ok: false, error: 'newerVersion' });
  });

  it('refuses a damaged row anywhere', () => {
    const damaged = [
      withChange((b) => { delete b.orders[0].deliveryDate; }),
      withChange((b) => { b.orders[0].status = 'lost'; }),
      withChange((b) => { b.orders[0].items[0].qty = '1'; }),
      withChange((b) => { b.orders[0].paidMethod = 'card'; }),
      withChange((b) => { b.customers[0].phone = 501234567; }),
      withChange((b) => { b.products[0].active = 'yes'; }),
      withChange((b) => { b.settings.logo = { type: 'image/png' }; }),
      withChange((b) => { b.settings.id = 'you'; }),
      withChange((b) => { delete b.products; }),
      withChange((b) => { b.orders[0].total = 320.5; }),
      withChange((b) => { b.orders[0].paidAmount = -100; }),
      withChange((b) => { b.orders[0].items[0].qty = 1.5; }),
      withChange((b) => { b.settings.logo.base64 = 'not base64!'; }),
      withChange((b) => { b.settings.logo.type = 'text/html'; }),
      withChange((b) => { b.schemaVersion = 0; }),
      withChange((b) => { delete b.ingredients; }),
      withChange((b) => { b.ingredients[0].unit = 'kg'; }),
      withChange((b) => { b.ingredients[0].packQty = 0; }),
      withChange((b) => { b.products[0].parts[0].lines[0].qty = -1; }),
      withChange((b) => { b.orders[0].items[0].unitCost = 9.5; }),
    ];
    for (const d of damaged) expect(parseBackup(d)).toEqual({ ok: false, error: 'damaged' });
  });

  it('refuses duplicate ids, orders whose customer is missing and recipes whose ingredient is', () => {
    const inconsistent = [
      withChange((b) => { b.customers.push({ ...b.customers[0] }); }),
      withChange((b) => { b.products.push({ ...b.products[0] }); }),
      withChange((b) => { b.orders.push({ ...b.orders[0] }); }),
      withChange((b) => { b.orders[0].customerId = 'gone'; }),
      withChange((b) => { b.ingredients.push({ ...b.ingredients[0] }); }),
      withChange((b) => { b.products[0].parts[0].lines[0].ingredientId = 'gone'; }),
    ];
    for (const d of inconsistent) expect(parseBackup(d)).toEqual({ ok: false, error: 'damaged' });
  });
});

describe('base64', () => {
  it('round-trips every byte value', () => {
    const bytes = new Uint8Array(256).map((_, i) => i);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });

  it('handles more bytes than one chunk', () => {
    const bytes = new Uint8Array(100_000).map((_, i) => i % 251);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });
});

describe('backupFileName', () => {
  it('is named by the local date', () => {
    expect(backupFileName(new Date(2026, 10, 2, 23, 59))).toBe('sweetspot-2026-11-02.json');
  });
});
