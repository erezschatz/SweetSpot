import { describe, expect, it } from 'vitest';
import { href, parseRoute, type Route } from './route';

describe('parseRoute', () => {
  it('reads each screen', () => {
    expect(parseRoute('#/orders')).toEqual({ name: 'orders' });
    expect(parseRoute('#/orders/new')).toEqual({ name: 'orderNew' });
    expect(parseRoute('#/orders/abc')).toEqual({ name: 'order', id: 'abc' });
    expect(parseRoute('#/orders/abc/edit')).toEqual({ name: 'orderEdit', id: 'abc' });
    expect(parseRoute('#/settings')).toEqual({ name: 'settings' });
    expect(parseRoute('#/customers')).toEqual({ name: 'customers' });
    expect(parseRoute('#/customers/new')).toEqual({ name: 'customerNew' });
    expect(parseRoute('#/customers/c1')).toEqual({ name: 'customer', id: 'c1' });
    expect(parseRoute('#/customers/c1/edit')).toEqual({ name: 'customerEdit', id: 'c1' });
  });

  it('sends anything unknown, and no hash at all, to the orders list', () => {
    expect(parseRoute('')).toEqual({ name: 'orders' });
    expect(parseRoute('#/')).toEqual({ name: 'orders' });
    expect(parseRoute('#/nothing/here')).toEqual({ name: 'orders' });
  });

  it('is the inverse of href', () => {
    const routes: Route[] = [
      { name: 'orders' }, { name: 'orderNew' }, { name: 'order', id: 'a b/c' },
      { name: 'orderEdit', id: 'x' }, { name: 'settings' }, { name: 'customers' }, { name: 'customerNew' },
      { name: 'customer', id: 'a b/c' }, { name: 'customerEdit', id: 'y' },
    ];
    for (const r of routes) expect(parseRoute(href(r))).toEqual(r);
  });
});
