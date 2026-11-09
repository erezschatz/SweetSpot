import { describe, expect, it } from 'vitest';
import type { Ingredient, Product } from '../db/schema';
import {
  costPerUnit,
  displayUnitCost,
  formatQty,
  formatShare,
  draftAsRecipe,
  ingredientFromDraft,
  ingredientMap,
  margin,
  monthMaterials,
  orderCost,
  parseQuantity,
  partCost,
  priceForMargin,
  productCost,
  recipeDraft,
  recipeFromDraft,
  scaleQty,
  usedIngredientIds,
  validateIngredient,
  validateRecipe,
} from './costing';

const ing = (id: string, packQty: number, packPrice: number): Ingredient => ({
  id, name: id, unit: 'g', packQty, packPrice, createdAt: '2026-11-09T10:00:00.000Z',
});
// Flour ₪6 for 1 kg, cream ₪12 for 250 ml, a box ₪3 each.
const flour = ing('flour', 1000, 600);
const cream = ing('cream', 250, 1200);
const box = ing('box', 1, 300);
const prices = ingredientMap([flour, cream, box]);

const cake: Pick<Product, 'parts'> = {
  parts: [
    { name: 'בצק', lines: [{ ingredientId: 'flour', qty: 300 }] },
    { name: 'קרם', lines: [{ ingredientId: 'cream', qty: 100 }, { ingredientId: 'box', qty: 1 }] },
  ],
};

describe('costPerUnit', () => {
  it('is the pack price over the pack quantity, unrounded', () => {
    expect(costPerUnit(flour)).toBeCloseTo(0.6);
    expect(costPerUnit(cream)).toBeCloseTo(4.8);
    expect(costPerUnit(box)).toBe(300);
  });
});

describe('partCost and productCost', () => {
  it('sums each part, and the product is the sum of its parts', () => {
    expect(partCost(cake.parts![0]!, prices)).toBe(180); // 300 g × 0.6 agorot
    expect(partCost(cake.parts![1]!, prices)).toBe(780); // 100 ml × 4.8 + 300
    expect(productCost(cake, prices)).toBe(960);
  });

  it('rounds each part to whole agorot', () => {
    const third = ing('third', 3, 100); // 33.33… agorot each
    const m = ingredientMap([third]);
    expect(partCost({ lines: [{ ingredientId: 'third', qty: 1 }] }, m)).toBe(33);
    expect(partCost({ lines: [{ ingredientId: 'third', qty: 2 }] }, m)).toBe(67);
    // Two parts of one third each: 33 + 33, the figures shown, not round(66.67).
    const two = { parts: [{ name: 'a', lines: [{ ingredientId: 'third', qty: 1 }] }, { name: 'b', lines: [{ ingredientId: 'third', qty: 1 }] }] };
    expect(productCost(two, m)).toBe(66);
  });

  it('gives no cost, not ₪0, without a recipe', () => {
    expect(productCost({}, prices)).toBeNull();
    expect(productCost({ parts: [] }, prices)).toBeNull();
    expect(productCost({ parts: [{ name: 'ריק', lines: [] }] }, prices)).toBeNull();
  });

  it('gives no cost when an ingredient is missing', () => {
    expect(productCost({ parts: [{ name: 'x', lines: [{ ingredientId: 'gone', qty: 1 }] }] }, prices)).toBeNull();
  });

  it('follows a changed ingredient price', () => {
    const dearer = ingredientMap([{ ...flour, packPrice: 1200 }, cream, box]);
    expect(productCost(cake, dearer)).toBe(360 + 780);
  });
});

describe('margin and price marks', () => {
  it('is price minus cost, and its share of the price', () => {
    expect(margin(10000, 6000)).toEqual({ amount: 4000, share: 0.4 });
    expect(margin(0, 500)).toEqual({ amount: -500, share: null });
  });

  it('marks 10% and 40% margin, rounded up to whole shekels', () => {
    expect(priceForMargin(9000, 10)).toBe(10000); // ₪90 ÷ 0.9 = ₪100 exactly
    expect(priceForMargin(6000, 40)).toBe(10000); // ₪60 ÷ 0.6 = ₪100 exactly
    expect(priceForMargin(960, 10)).toBe(1100); // ₪10.67 → ₪11
    expect(priceForMargin(960, 40)).toBe(1600); // ₪16.00 → ₪16
    expect(priceForMargin(961, 40)).toBe(1700); // ₪16.02 → ₪17
    expect(priceForMargin(0, 40)).toBe(0);
  });
});

describe('scaleQty', () => {
  it('multiplies without float noise', () => {
    expect(scaleQty(0.1, 3)).toBe(0.3);
    expect(scaleQty(300, 2.5)).toBe(750);
  });
});

describe('orderCost and monthMaterials', () => {
  it('adds qty × unitCost and counts the lines without a cost', () => {
    expect(orderCost([{ qty: 2, unitCost: 960 }, { qty: 1 }, { qty: 1, unitCost: 0 }])).toEqual({ cost: 1920, costed: 2, uncosted: 1 });
  });

  it('counts only orders delivered in the month, by delivery date', () => {
    const orders = [
      { status: 'delivered' as const, deliveryDate: '2026-11-03', items: [{ qty: 1, unitCost: 1000 }, { qty: 1 }] },
      { status: 'delivered' as const, deliveryDate: '2026-10-31', items: [{ qty: 1, unitCost: 5000 }] },
      { status: 'confirmed' as const, deliveryDate: '2026-11-04', items: [{ qty: 1, unitCost: 7000 }] },
      { status: 'cancelled' as const, deliveryDate: '2026-11-05', items: [{ qty: 1, unitCost: 9000 }] },
    ].map((o) => ({ ...o, items: o.items.map((i) => ({ name: 'x', unitPrice: 0, details: '', ...i })) }));
    expect(monthMaterials(orders, '2026-11')).toEqual({ cost: 1000, uncosted: 1 });
    expect(monthMaterials(orders, '2026-10')).toEqual({ cost: 5000, uncosted: 0 });
  });
});

describe('usedIngredientIds', () => {
  it('collects every ingredient a recipe names', () => {
    expect([...usedIngredientIds([cake, {}])].sort()).toEqual(['box', 'cream', 'flour']);
  });
});

describe('ingredient form', () => {
  it('needs a name, a pack quantity above 0 and a price', () => {
    expect(validateIngredient({ name: ' ', unit: 'g', packQty: '0', packPrice: 'x' })).toEqual(['name', 'packQty', 'packPrice']);
    expect(validateIngredient({ name: 'קמח', unit: 'g', packQty: '1,000', packPrice: '6' })).toEqual([]);
  });

  it('builds the row, keeping id and createdAt on an edit', () => {
    const made = ingredientFromDraft({ name: ' קמח ', unit: 'g', packQty: '1000', packPrice: '6.5' }, 'i1', '2026-11-09T12:00:00.000Z', flour);
    expect(made).toEqual({ id: 'i1', name: 'קמח', unit: 'g', packQty: 1000, packPrice: 650, createdAt: flour.createdAt });
  });

  it('reads quantities', () => {
    expect(parseQuantity('0.5')).toBe(0.5);
    expect(parseQuantity('')).toBeNull();
    expect(parseQuantity('-1')).toBeNull();
  });
});

describe('recipe drafts', () => {
  it('round-trips a recipe', () => {
    expect(recipeFromDraft(recipeDraft(cake.parts))).toEqual(cake.parts);
  });

  it('drops empty lines and parts, and an empty recipe is no recipe', () => {
    const draft = [
      { name: 'בצק', lines: [{ ingredientId: 'flour', qty: '300' }, { ingredientId: '', qty: '' }] },
      { name: '', lines: [{ ingredientId: '', qty: '' }] },
    ];
    expect(validateRecipe(draft)).toEqual([]);
    expect(recipeFromDraft(draft)).toEqual([{ name: 'בצק', lines: [{ ingredientId: 'flour', qty: 300 }] }]);
    expect(recipeFromDraft([{ name: '', lines: [] }])).toBeUndefined();
    expect(recipeFromDraft([{ name: 'קישוט', lines: [{ ingredientId: '', qty: '' }] }])).toBeUndefined();
  });

  it('asks for a part name, an ingredient and a quantity', () => {
    expect(validateRecipe([{ name: '', lines: [{ ingredientId: 'flour', qty: '1' }] }])).toEqual(['partName']);
    expect(validateRecipe([{ name: 'א', lines: [{ ingredientId: '', qty: '5' }, { ingredientId: 'flour', qty: '0' }] }])).toEqual(['lineIngredient', 'lineQty']);
  });

  it('costs a half-typed draft by its readable lines', () => {
    const draft = [{ name: 'בצק', lines: [{ ingredientId: 'flour', qty: '300' }, { ingredientId: 'cream', qty: 'abc' }] }];
    expect(productCost({ parts: draftAsRecipe(draft) }, prices)).toBe(180);
  });
});

describe('display', () => {
  it('shows grams and millilitres per kilo or litre, pieces per piece', () => {
    expect(displayUnitCost(flour)).toBe(600);
    expect(displayUnitCost({ ...cream, unit: 'ml' })).toBe(4800);
    expect(displayUnitCost({ ...box, unit: 'pcs' })).toBe(300);
    expect(displayUnitCost({ unit: 'pcs', packQty: 3, packPrice: 100 })).toBe(33);
  });
  it('formats quantities and shares', () => {
    expect(formatQty(1500)).toMatch(/1,?500/);
    expect(formatQty(0.25)).toBe('0.25');
    expect(formatShare(0.4)).toMatch(/40/);
  });
});
