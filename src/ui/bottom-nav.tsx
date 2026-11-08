import { he } from '../i18n/he';
import { href, type Route } from '../lib/route';

// The main screens, under the thumb (step 07; money since step 08, D39). Settings is the
// gear in the header.
const tabs: { route: Route; label: string; owns: (r: Route) => boolean }[] = [
  { route: { name: 'diary' }, label: he.nav.diary, owns: (r) => r.name === 'diary' },
  { route: { name: 'orders' }, label: he.nav.orders, owns: (r) => r.name.startsWith('order') },
  { route: { name: 'customers' }, label: he.nav.customers, owns: (r) => r.name.startsWith('customer') },
  { route: { name: 'products' }, label: he.nav.products, owns: (r) => r.name.startsWith('product') },
  { route: { name: 'money' }, label: he.nav.money, owns: (r) => r.name === 'money' },
];

/** Forms keep their sticky save bar at the bottom, so the tabs step aside there. */
export function showsBottomNav(route: Route): boolean {
  return !['orderNew', 'orderEdit', 'customerNew', 'customerEdit', 'productNew', 'productEdit'].includes(route.name);
}

export function BottomNav({ route }: { route: Route }) {
  return (
    <nav class="bottom-nav">
      {tabs.map((tab) => (
        <a key={tab.label} href={href(tab.route)} class={tab.owns(route) ? 'on' : ''}>
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

/** Material Design's "settings" gear (Apache 2.0), inline: an emoji gear differs on every phone. */
export function SettingsGear({ on }: { on: boolean }) {
  return (
    <a href={href({ name: 'settings' })} class={`gear${on ? ' on' : ''}`} aria-label={he.nav.settings}>
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"
        />
      </svg>
    </a>
  );
}
