import type { Ingredient, IngredientUnit, Order, Product, RecipePart } from '../db/schema';
import { monthOf, parseShekels, type Agorot, type Month } from './money';

// What a cake costs her in materials (step 09, D35, D36). Costs are computed live from
// the current ingredient prices; only an order line keeps a snapshot (`unitCost`).

/** Agorot per one gram, millilitre or piece: a fraction, rounded only where a cost is shown. */
export function costPerUnit(ingredient: Pick<Ingredient, 'packQty' | 'packPrice'>): number {
  return ingredient.packPrice / ingredient.packQty;
}

type Prices = ReadonlyMap<string, Pick<Ingredient, 'packQty' | 'packPrice'>>;

export function ingredientMap<T extends Pick<Ingredient, 'id'>>(ingredients: T[]): Map<string, T> {
  return new Map(ingredients.map((i) => [i.id, i]));
}

/**
 * A part's cost in whole agorot, or null when a line names an ingredient that is not there.
 * Each part is rounded on its own and the product is the sum of its parts, so the figures
 * she sees on the form add up exactly (D14).
 */
export function partCost(part: Pick<RecipePart, 'lines'>, prices: Prices): Agorot | null {
  let total = 0;
  for (const line of part.lines) {
    const ingredient = prices.get(line.ingredientId);
    if (!ingredient) return null;
    total += line.qty * costPerUnit(ingredient);
  }
  return Math.round(total);
}

export function hasRecipe(product: Pick<Product, 'parts'>): boolean {
  return (product.parts ?? []).some((p) => p.lines.length > 0);
}

/** No recipe, or a line whose ingredient is missing: no cost, which is not ₪0 (D35). */
export function productCost(product: Pick<Product, 'parts'>, prices: Prices): Agorot | null {
  if (!hasRecipe(product)) return null;
  let total = 0;
  for (const part of product.parts!) {
    const cost = partCost(part, prices);
    if (cost === null) return null;
    total += cost;
  }
  return total;
}

export interface Margin {
  amount: Agorot;
  /** A share of the price, 0.4 for 40%; null when the price is 0. */
  share: number | null;
}

export function margin(price: Agorot, cost: Agorot): Margin {
  return { amount: price - cost, share: price > 0 ? (price - cost) / price : null };
}

/**
 * The price that leaves `marginPercent` of it as margin: cost ÷ (1 − margin), rounded up to
 * whole shekels (D36). Integer arithmetic, so 10% of ₪90 is ₪100 and not ₪100.00000001.
 */
export function priceForMargin(cost: Agorot, marginPercent: number): Agorot {
  const divisor = (100 - marginPercent) * 100;
  return Math.ceil((cost * 100) / divisor) * 100;
}

export const minimumMargin = 10;
export const recommendedMargin = 40;

/** A recipe quantity times the number of units she typed, without float noise: 0.1 × 3 is 0.3. */
export function scaleQty(qty: number, units: number): number {
  return Math.round(qty * units * 1000) / 1000;
}

/** What an order's lines cost in materials, from the snapshots; lines without one are left out. */
export function orderCost(items: Pick<Order['items'][number], 'qty' | 'unitCost'>[]): { cost: Agorot; costed: number; uncosted: number } {
  let cost = 0;
  let costed = 0;
  for (const item of items) {
    if (item.unitCost === undefined) continue;
    cost += item.qty * item.unitCost;
    costed += 1;
  }
  return { cost, costed, uncosted: items.length - costed };
}

/** Ingredient ids any recipe uses: an ingredient among them is not deleted (D35). */
export function usedIngredientIds(products: Pick<Product, 'parts'>[]): Set<string> {
  const used = new Set<string>();
  for (const product of products) for (const part of product.parts ?? []) for (const line of part.lines) used.add(line.ingredientId);
  return used;
}

/**
 * The price she compares when shopping: per kilo or litre for grams and millilitres, since
 * a price per gram is a fraction of an agora; per piece for pieces. Whole agorot.
 */
export function displayUnitCost(ingredient: Pick<Ingredient, 'unit' | 'packQty' | 'packPrice'>): Agorot {
  const per = ingredient.unit === 'pcs' ? 1 : 1000;
  return Math.round(costPerUnit(ingredient) * per);
}

const qtyFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 3 });

/** 1500 → "1,500"; 0.25 → "0.25". */
export function formatQty(qty: number): string {
  return qtyFormat.format(qty);
}

const percentFormat = new Intl.NumberFormat('he-IL', { style: 'percent', maximumFractionDigits: 0 });

/** 0.4 → "40%". */
export function formatShare(share: number): string {
  return percentFormat.format(share);
}

// --- the ingredient form

export type IngredientError = 'name' | 'packQty' | 'packPrice';

export interface IngredientDraft {
  name: string;
  unit: IngredientUnit;
  packQty: string;
  packPrice: string;
}

export const units: IngredientUnit[] = ['g', 'ml', 'pcs'];

/** "1,000", "0.5" → a number above 0; null otherwise. */
export function parseQuantity(text: string): number | null {
  const cleaned = text.trim().replace(/,/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function validateIngredient(draft: IngredientDraft): IngredientError[] {
  const errors: IngredientError[] = [];
  if (draft.name.trim() === '') errors.push('name');
  if (parseQuantity(draft.packQty) === null) errors.push('packQty');
  const price = parseShekels(draft.packPrice);
  if (price === null || price < 0) errors.push('packPrice');
  return errors;
}

/** Call only when validateIngredient returned no errors. An edit keeps id and createdAt. */
export function ingredientFromDraft(draft: IngredientDraft, id: string, now: string, existing?: Ingredient): Ingredient {
  return {
    id,
    name: draft.name.trim(),
    unit: draft.unit,
    packQty: parseQuantity(draft.packQty)!,
    packPrice: parseShekels(draft.packPrice)!,
    createdAt: existing?.createdAt ?? now,
  };
}

// --- the recipe on the product form: text while she types, a RecipePart[] when saved

export interface RecipeLineDraft {
  ingredientId: string;
  qty: string;
}

export interface PartDraft {
  name: string;
  lines: RecipeLineDraft[];
}

export type RecipeError = 'partName' | 'lineIngredient' | 'lineQty';

export function recipeDraft(parts: RecipePart[] | undefined): PartDraft[] {
  return (parts ?? []).map((p) => ({
    name: p.name,
    lines: p.lines.map((l) => ({ ingredientId: l.ingredientId, qty: String(l.qty) })),
  }));
}

const blankLine = (l: RecipeLineDraft) => l.ingredientId === '' && l.qty.trim() === '';
const blankPart = (p: PartDraft) => p.name.trim() === '' && p.lines.every(blankLine);

/** A line or a part she left completely empty is dropped, not an error. */
export function validateRecipe(parts: PartDraft[]): RecipeError[] {
  const errors = new Set<RecipeError>();
  for (const part of parts) {
    if (blankPart(part)) continue;
    if (part.name.trim() === '') errors.add('partName');
    for (const line of part.lines) {
      if (blankLine(line)) continue;
      if (line.ingredientId === '') errors.add('lineIngredient');
      if (parseQuantity(line.qty) === null) errors.add('lineQty');
    }
  }
  return [...errors];
}

/**
 * Call only when validateRecipe returned no errors. A part left with no lines is dropped
 * even if named; nothing left → undefined: no recipe.
 */
export function recipeFromDraft(parts: PartDraft[]): RecipePart[] | undefined {
  const kept = parts
    .map((p) => ({
      name: p.name.trim(),
      lines: p.lines.filter((l) => !blankLine(l)).map((l) => ({ ingredientId: l.ingredientId, qty: parseQuantity(l.qty)! })),
    }))
    .filter((p) => p.lines.length > 0);
  return kept.length > 0 ? kept : undefined;
}

/** The draft as a recipe for the live cost on the form: unreadable lines count as nothing. */
export function draftAsRecipe(parts: PartDraft[]): RecipePart[] {
  return parts.map((p) => ({
    name: p.name,
    lines: p.lines.flatMap((l) => {
      const qty = parseQuantity(l.qty);
      return l.ingredientId !== '' && qty !== null ? [{ ingredientId: l.ingredientId, qty }] : [];
    }),
  }));
}

// --- money: what the month's cakes cost (D35)

/**
 * The materials of the orders delivered in the month, by delivery date (D35 g), from the
 * snapshots on their lines. `uncosted` counts the lines left out, so the screen can say so.
 */
export function monthMaterials(
  orders: Pick<Order, 'status' | 'deliveryDate' | 'items'>[],
  month: Month,
): { cost: Agorot; uncosted: number } {
  let cost = 0;
  let uncosted = 0;
  for (const order of orders) {
    if (order.status !== 'delivered' || monthOf(order.deliveryDate) !== month) continue;
    const o = orderCost(order.items);
    cost += o.cost;
    uncosted += o.uncosted;
  }
  return { cost, uncosted };
}
