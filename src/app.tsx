import { useLiveQuery } from 'dexie-react-hooks';
import { he } from './i18n/he';
import { settingsRepo } from './db/repositories';
import { href } from './lib/route';
import { LogoImage } from './ui/logo';
import { useRoute } from './ui/router';
import { OrdersScreen } from './screens/orders';
import { OrderFormScreen } from './screens/order-form';
import { OrderDetailScreen } from './screens/order-detail';
import { SettingsScreen } from './screens/settings';

// Until the bottom navigation of step 07, two links in the header reach the two screens.
export function App() {
  const settings = useLiveQuery(() => settingsRepo.get());
  const route = useRoute();

  return (
    <main class="screen">
      <header class="app-header">
        {settings?.logo && <LogoImage logo={settings.logo} class="header-logo" />}
        <div class="header-text">
          <h1>{settings?.businessName || he.appName}</h1>
          <nav class="top-nav">
            <a href={href({ name: 'orders' })} class={route.name.startsWith('order') ? 'on' : ''}>{he.nav.orders}</a>
            <a href={href({ name: 'settings' })} class={route.name === 'settings' ? 'on' : ''}>{he.nav.settings}</a>
          </nav>
        </div>
      </header>
      {route.name === 'orders' && <OrdersScreen />}
      {route.name === 'orderNew' && <OrderFormScreen />}
      {route.name === 'orderEdit' && <OrderFormScreen key={route.id} id={route.id} />}
      {route.name === 'order' && <OrderDetailScreen id={route.id} />}
      {route.name === 'settings' && <SettingsScreen />}
    </main>
  );
}
