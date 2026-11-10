import { describe, expect, it } from 'vitest';
import { href, parseRoute, type Route } from './route';

describe('parseRoute', () => {
  it('reads each screen', () => {
    expect(parseRoute('#/orders')).toEqual({ name: 'orders' });
    expect(parseRoute('#/orders/new')).toEqual({ name: 'orderNew' });
    expect(parseRoute('#/orders/abc')).toEqual({ name: 'order', id: 'abc' });
    expect(parseRoute('#/orders/abc/edit')).toEqual({ name: 'orderEdit', id: 'abc' });
    expect(parseRoute('#/settings')).toEqual({ name: 'settings' });
    expect(parseRoute('#/money')).toEqual({ name: 'money' });
    expect(parseRoute('#/ingredients')).toEqual({ name: 'ingredients' });
    expect(parseRoute('#/ingredients/new')).toEqual({ name: 'ingredientNew' });
    expect(parseRoute('#/ingredients/i1')).toEqual({ name: 'ingredientEdit', id: 'i1' });
    expect(parseRoute('#/shopping')).toEqual({ name: 'shopping' });
    expect(parseRoute('#/install')).toEqual({ name: 'install' });
    expect(parseRoute('#/customers')).toEqual({ name: 'customers' });
    expect(parseRoute('#/customers/new')).toEqual({ name: 'customerNew' });
    expect(parseRoute('#/customers/c1')).toEqual({ name: 'customer', id: 'c1' });
    expect(parseRoute('#/customers/c1/edit')).toEqual({ name: 'customerEdit', id: 'c1' });
    expect(parseRoute('#/products')).toEqual({ name: 'products' });
    expect(parseRoute('#/products/new')).toEqual({ name: 'productNew' });
    expect(parseRoute('#/products/p1')).toEqual({ name: 'productEdit', id: 'p1' });
  });

  it('sends anything unknown, and no hash at all, to the diary', () => {
    expect(parseRoute('')).toEqual({ name: 'diary' });
    expect(parseRoute('#/')).toEqual({ name: 'diary' });
    expect(parseRoute('#/nothing/here')).toEqual({ name: 'diary' });
    expect(parseRoute('#/orders/abc/nonsense')).toEqual({ name: 'order', id: 'abc' });
  });

  it('is the inverse of href', () => {
    const routes: Route[] = [
      { name: 'diary' }, { name: 'orders' }, { name: 'orderNew' }, { name: 'order', id: 'a b/c' },
      { name: 'orderEdit', id: 'x' }, { name: 'settings' }, { name: 'money' }, { name: 'ingredients' }, { name: 'ingredientNew' }, { name: 'ingredientEdit', id: 'i 1' }, { name: 'shopping' }, { name: 'install' }, { name: 'customers' }, { name: 'customerNew' },
      { name: 'customer', id: 'a b/c' }, { name: 'customerEdit', id: 'y' },
      { name: 'products' }, { name: 'productNew' }, { name: 'productEdit', id: 'p 1' },
    ];
    for (const r of routes) expect(parseRoute(href(r))).toEqual(r);
  });
});
