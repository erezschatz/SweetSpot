import { describe, expect, it } from 'vitest';
import type { Product } from '../db/schema';
import { findByName, productFromDraft, splitCatalogue, validateProduct } from './products';

const p = (id: string, name: string, active = true): Product => ({ id, name, price: 32000, active, createdAt: '2026-11-01T00:00:00Z' });

describe('validateProduct', () => {
  it('needs a name and a price that is a number', () => {
    expect(validateProduct({ name: 'עוגת פרחים', price: '320' })).toEqual([]);
    expect(validateProduct({ name: '  ', price: '' })).toEqual(['name', 'price']);
    expect(validateProduct({ name: 'עוגה', price: 'הרבה' })).toEqual(['price']);
    expect(validateProduct({ name: 'עוגה', price: '-5' })).toEqual(['price']);
  });

  it('accepts ₪0, and shekels with agorot', () => {
    expect(validateProduct({ name: 'טעימה', price: '0' })).toEqual([]);
    expect(validateProduct({ name: 'עוגייה', price: '7.5' })).toEqual([]);
  });
});

describe('productFromDraft', () => {
  const now = '2026-11-05T10:00:00Z';

  it('builds a new product in agorot, trimmed', () => {
    expect(productFromDraft({ name: ' עוגת פרחים ', price: '320', active: true }, 'p1', now)).toEqual({
      id: 'p1', name: 'עוגת פרחים', price: 32000, active: true, createdAt: now,
    });
  });

  it('keeps createdAt on edit, and can retire', () => {
    const edited = productFromDraft({ name: 'עוגת פרחים', price: '350', active: false }, 'p1', now, p('p1', 'עוגת פרחים'));
    expect([edited.price, edited.active, edited.createdAt]).toEqual([35000, false, '2026-11-01T00:00:00Z']);
  });
});

describe('splitCatalogue', () => {
  it('sorts by Hebrew name and puts retired products apart', () => {
    const { active, retired } = splitCatalogue([p('1', 'קאפקייקס'), p('2', 'עוגה ישנה', false), p('3', 'בראוניז')]);
    expect(active.map((x) => x.name)).toEqual(['בראוניז', 'קאפקייקס']);
    expect(retired.map((x) => x.name)).toEqual(['עוגה ישנה']);
  });
});

describe('findByName', () => {
  const all = [p('1', 'עוגת פרחים'), p('2', 'Brownies')];

  it('finds the same name with other spacing or case', () => {
    expect(findByName(all, ' עוגת פרחים ')?.id).toBe('1');
    expect(findByName(all, 'brownies')?.id).toBe('2');
  });

  it('skips the product being edited and an empty name', () => {
    expect(findByName(all, 'עוגת פרחים', '1')).toBeUndefined();
    expect(findByName(all, '')).toBeUndefined();
  });
});
