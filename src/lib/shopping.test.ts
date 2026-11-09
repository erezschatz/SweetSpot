import { describe, expect, it } from 'vitest';
import type { Ingredient, Order, Product } from '../db/schema';
import { shoppingList } from './shopping';

const today = '2026-11-09';
const ing = (id: string, packQty: number): Ingredient => ({
  id, name: id, unit: 'g', packQty, packPrice: 100, createdAt: '2026-11-01T00:00:00.000Z',
});
const ingredients = [ing('flour', 1000), ing('eggs', 12)];
const cake: Product = {
  id: 'cake', name: 'עוגה', price: 20000, active: true, createdAt: '2026-11-01T00:00:00.000Z',
  parts: [{ name: 'בצק', lines: [{ ingredientId: 'flour', qty: 400 }, { ingredientId: 'eggs', qty: 5 }] }],
};
const plain: Product = { id: 'plain', name: 'עוגיות', price: 5000, active: true, createdAt: '2026-11-01T00:00:00.000Z' };

const order = (deliveryDate: string, status: Order['status'], items: Order['items']) => ({ deliveryDate, status, items });
const line = (productId: string | undefined, name: string, qty: number) => ({
  ...(productId ? { productId } : {}), name, qty, unitPrice: 0, details: '',
});

describe('shoppingList', () => {
  it('sums recipes × quantities for open orders due in the next fourteen days', () => {
    const list = shoppingList(
      [
        order('2026-11-09', 'confirmed', [line('cake', 'עוגה', 2)]),
        order('2026-11-22', 'new', [line('cake', 'עוגה', 1), line('plain', 'עוגיות', 3)]),
        order('2026-11-23', 'confirmed', [line('cake', 'עוגה', 9)]), // day 15: out
        order('2026-11-08', 'confirmed', [line('cake', 'עוגה', 9)]), // overdue: out
        order('2026-11-10', 'delivered', [line('cake', 'עוגה', 9)]),
        order('2026-11-10', 'cancelled', [line('cake', 'עוגה', 9)]),
        order('2026-11-12', 'new', [line(undefined, 'מגש פירות', 1)]),
      ],
      [cake, plain],
      ingredients,
      today,
    );
    expect(list.orderCount).toBe(3);
    expect(list.until).toBe('2026-11-22');
    expect(list.lines.map((l) => [l.ingredient.id, l.qty, l.packs])).toEqual([
      ['eggs', 15, 2],
      ['flour', 1200, 2],
    ]);
    expect(list.notCovered).toEqual([
      { name: 'מגש פירות', qty: 1 },
      { name: 'עוגיות', qty: 3 },
    ]);
  });

  it('buys an exact number of packs when the total fills them', () => {
    const list = shoppingList([order(today, 'new', [line('cake', 'עוגה', 5)])], [cake], ingredients, today);
    expect(list.lines.find((l) => l.ingredient.id === 'flour')).toMatchObject({ qty: 2000, packs: 2 });
  });

  it('is empty with nothing due', () => {
    expect(shoppingList([], [cake], ingredients, today)).toMatchObject({ lines: [], notCovered: [], orderCount: 0 });
  });
});
