// Hand-rolled hash routes (docs/SPEC.md, Architecture): a handful of screens do not need a router library.

export type Route =
  | { name: 'orders' }
  | { name: 'orderNew' }
  | { name: 'order'; id: string }
  | { name: 'orderEdit'; id: string }
  | { name: 'customers' }
  | { name: 'customerNew' }
  | { name: 'customer'; id: string }
  | { name: 'customerEdit'; id: string }
  | { name: 'settings' };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [first, second, third] = parts;
  if (first === 'settings') return { name: 'settings' };
  if (first === 'orders') {
    if (second === 'new') return { name: 'orderNew' };
    if (second && third === 'edit') return { name: 'orderEdit', id: second };
    if (second) return { name: 'order', id: second };
  }
  if (first === 'customers') {
    if (!second) return { name: 'customers' };
    if (second === 'new') return { name: 'customerNew' };
    if (third === 'edit') return { name: 'customerEdit', id: second };
    return { name: 'customer', id: second };
  }
  // Until the diary (step 07) exists, the orders list is the front screen.
  return { name: 'orders' };
}

export function href(route: Route): string {
  switch (route.name) {
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
    case 'settings':
      return '#/settings';
  }
}
