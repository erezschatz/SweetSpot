import type { Product } from '../db/schema';
import { parseShekels } from './money';

// The catalogue (step 06): each cake once, with its price. Products are never deleted,
// only retired, so old orders keep pointing at them (D34).

export type ProductError = 'name' | 'price';

/** A name, and a price that is a number ≥ 0. Unlike an order line, a product must have a price. */
export function validateProduct(draft: { name: string; price: string }): ProductError[] {
  const errors: ProductError[] = [];
  if (draft.name.trim() === '') errors.push('name');
  const price = parseShekels(draft.price);
  if (price === null || price < 0) errors.push('price');
  return errors;
}

/** Call only when validateProduct returned no errors. An edit keeps id and createdAt. */
export function productFromDraft(
  draft: { name: string; price: string; active: boolean },
  id: string,
  now: string,
  existing?: Product,
): Product {
  return {
    id,
    name: draft.name.trim(),
    price: parseShekels(draft.price)!,
    active: draft.active,
    createdAt: existing?.createdAt ?? now,
  };
}

/** What she sells now, by name; retired ones apart, after them. */
export function splitCatalogue<T extends Pick<Product, 'name' | 'active'>>(products: T[]): { active: T[]; retired: T[] } {
  const byName = [...products].sort((a, b) => a.name.localeCompare(b.name, 'he'));
  return { active: byName.filter((p) => p.active), retired: byName.filter((p) => !p.active) };
}

/** Another product already called this, ignoring spaces at the ends and case. */
export function findByName<T extends Pick<Product, 'id' | 'name'>>(products: T[], name: string, exceptId?: string): T | undefined {
  const wanted = name.trim().toLowerCase();
  if (wanted === '') return undefined;
  return products.find((p) => p.id !== exceptId && p.name.trim().toLowerCase() === wanted);
}
