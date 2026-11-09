import type { Ingredient, Order, Product } from '../db/schema';
import { productCost } from './costing';
import { addDays } from './dates';

// The shopping list (D36): what the open orders due in the next fourteen days need, summed
// by ingredient from the current recipes. Derived each time; nothing is stored or ticked.

export const shoppingDays = 14;

export interface ShoppingLine<I> {
  ingredient: I;
  /** In the ingredient's unit. */
  qty: number;
  /** Whole packs to buy: never a part of one. */
  packs: number;
}

export interface ShoppingList<I> {
  lines: ShoppingLine<I>[];
  /** Products on those orders with no usable recipe, so she knows what the list leaves out. */
  notCovered: { name: string; qty: number }[];
  orderCount: number;
  /** The last day counted, for the screen's heading. */
  until: string;
}

/** Today and the thirteen days after it; overdue orders are left out, as most were delivered and not marked. */
export function shoppingList<I extends Ingredient>(
  orders: Pick<Order, 'status' | 'deliveryDate' | 'items'>[],
  products: Pick<Product, 'id' | 'parts'>[],
  ingredients: I[],
  today: string,
): ShoppingList<I> {
  const end = addDays(today, shoppingDays);
  const due = orders.filter(
    (o) => (o.status === 'new' || o.status === 'confirmed') && o.deliveryDate >= today && o.deliveryDate < end,
  );
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const productById = new Map(products.map((p) => [p.id, p]));

  const totals = new Map<string, number>();
  const notCovered = new Map<string, number>();
  for (const order of due) {
    for (const item of order.items) {
      const product = item.productId ? productById.get(item.productId) : undefined;
      if (!product || productCost(product, byId) === null) {
        notCovered.set(item.name, (notCovered.get(item.name) ?? 0) + item.qty);
        continue;
      }
      for (const part of product.parts!) {
        for (const line of part.lines) {
          totals.set(line.ingredientId, (totals.get(line.ingredientId) ?? 0) + line.qty * item.qty);
        }
      }
    }
  }

  const lines = [...totals].map(([id, raw]) => {
    const ingredient = byId.get(id)!;
    // Rounded to a thousandth first, so 0.1 + 0.2 grams does not ask for an extra pack.
    const qty = Math.round(raw * 1000) / 1000;
    return { ingredient, qty, packs: Math.ceil(Math.round((qty / ingredient.packQty) * 1e6) / 1e6) };
  });
  lines.sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name, 'he'));

  return {
    lines,
    notCovered: [...notCovered].map(([name, qty]) => ({ name, qty })).sort((a, b) => a.name.localeCompare(b.name, 'he')),
    orderCount: due.length,
    until: addDays(end, -1),
  };
}
