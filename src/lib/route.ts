// Hand-rolled hash routes (docs/SPEC.md, Architecture): a handful of screens do not need a router library.

export type Route =
  | { name: 'diary' }
  | { name: 'orders' }
  | { name: 'orderNew' }
  | { name: 'order'; id: string }
  | { name: 'orderEdit'; id: string }
  | { name: 'customers' }
  | { name: 'customerNew' }
  | { name: 'customer'; id: string }
  | { name: 'customerEdit'; id: string }
  | { name: 'products' }
  | { name: 'productNew' }
  | { name: 'productEdit'; id: string }
  | { name: 'money' }
  | { name: 'settings' };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [first, second, third] = parts;
  if (first === 'settings') return { name: 'settings' };
  if (first === 'money') return { name: 'money' };
  if (first === 'orders') {
    if (!second) return { name: 'orders' };
    if (second === 'new') return { name: 'orderNew' };
    if (second && third === 'edit') return { name: 'orderEdit', id: second };
    if (second) return { name: 'order', id: second };
  }
  // A product has no screen of its own: tapping it opens the form.
  if (first === 'products') {
    if (!second) return { name: 'products' };
    if (second === 'new') return { name: 'productNew' };
    return { name: 'productEdit', id: second };
  }
  if (first === 'customers') {
    if (!second) return { name: 'customers' };
    if (second === 'new') return { name: 'customerNew' };
    if (third === 'edit') return { name: 'customerEdit', id: second };
    return { name: 'customer', id: second };
  }
  // The diary is the front screen: no hash, and anything unknown, land there.
  return { name: 'diary' };
}

export function href(route: Route): string {
  switch (route.name) {
    case 'diary':
      return '#/';
    case 'orders':
      return '#/orders';
    case 'orderNew':
      return '#/orders/new';
    case 'order':
      return `#/orders/${encodeURIComponent(route.id)}`;
    case 'orderEdit':
      return `#/orders/${encodeURIComponent(route.id)}/edit`;
    case 'customers':
      return '#/customers';
    case 'customerNew':
      return '#/customers/new';
    case 'customer':
      return `#/customers/${encodeURIComponent(route.id)}`;
    case 'customerEdit':
      return `#/customers/${encodeURIComponent(route.id)}/edit`;
    case 'products':
      return '#/products';
    case 'productNew':
      return '#/products/new';
    case 'productEdit':
      return `#/products/${encodeURIComponent(route.id)}`;
    case 'money':
      return '#/money';
    case 'settings':
      return '#/settings';
  }
}
