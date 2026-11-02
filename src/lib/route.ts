// Hand-rolled hash routes (docs/SPEC.md, Architecture): five screens do not need a router library.

export type Route =
  | { name: 'orders' }
  | { name: 'orderNew' }
  | { name: 'order'; id: string }
  | { name: 'orderEdit'; id: string }
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
    case 'settings':
      return '#/settings';
  }
}
