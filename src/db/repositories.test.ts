// The first test of src/db (D33): Dexie against an in-memory IndexedDB, so the schema,
// the transactions and the restore run as they do on the phone, without one.
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, type Ingredient, type Product } from './schema';
import { ingredientsRepo, productsRepo } from './repositories';
import { restoreBackup } from './backup';
import { parseBackup, serialiseBackup } from '../lib/backup';

const flour: Ingredient = { id: 'i1', name: 'קמח', unit: 'g', packQty: 1000, packPrice: 600, createdAt: '2026-11-09T10:00:00.000Z' };
const sugar: Ingredient = { id: 'i2', name: 'סוכר', unit: 'g', packQty: 1000, packPrice: 500, createdAt: '2026-11-09T10:00:00.000Z' };
const cake: Product = {
  id: 'p1', name: 'עוגה', price: 20000, active: true, createdAt: '2026-11-09T10:00:00.000Z',
  parts: [{ name: 'בצק', lines: [{ ingredientId: 'i1', qty: 300 }] }],
};

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
});

describe('ingredientsRepo.deleteIfUnused', () => {
  it('refuses an ingredient a recipe uses and deletes one none does', async () => {
    await ingredientsRepo.put(flour);
    await ingredientsRepo.put(sugar);
    await productsRepo.put(cake);
    expect(await ingredientsRepo.deleteIfUnused('i1')).toBe(false);
    expect(await ingredientsRepo.get('i1')).toEqual(flour);
    expect(await ingredientsRepo.deleteIfUnused('i2')).toBe(true);
    expect(await ingredientsRepo.get('i2')).toBeUndefined();
  });
});

describe('restoreBackup', () => {
  const settings = { id: 'me' as const, businessName: 'העוגות של נועה', templates: {}, schemaVersion: 2 };

  it('brings back ingredients and recipes from a version 2 file', async () => {
    const text = serialiseBackup({ settings, products: [cake], customers: [], orders: [], ingredients: [flour] }, '2026-11-09T12:00:00.000Z');
    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error(parsed.error);
    await restoreBackup(parsed.backup);
    expect(await ingredientsRepo.all()).toEqual([flour]);
    expect(await productsRepo.get('p1')).toEqual(cake);
  });

  it('restores a version 1 file and clears the ingredients that were there', async () => {
    await ingredientsRepo.put(sugar);
    const v1 = JSON.stringify({
      app: 'sweetspot', schemaVersion: 1, exportedAt: '2026-11-01T12:00:00.000Z',
      settings: { ...settings, schemaVersion: 1 },
      products: [{ id: 'p9', name: 'ישנה', price: 10000, active: true, createdAt: '2026-11-01T10:00:00.000Z' }],
      customers: [], orders: [],
    });
    const parsed = parseBackup(v1);
    if (!parsed.ok) throw new Error(parsed.error);
    await restoreBackup(parsed.backup);
    expect(await ingredientsRepo.all()).toEqual([]);
    expect((await productsRepo.all()).map((p) => p.id)).toEqual(['p9']);
    expect((await db.settings.get('me'))?.schemaVersion).toBe(2);
  });
});
