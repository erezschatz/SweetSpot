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
import { CustomersScreen } from './screens/customers';
import { CustomerDetailScreen } from './screens/customer-detail';
import { CustomerFormScreen } from './screens/customer-form';
import { ProductsScreen } from './screens/products';
import { ProductFormScreen } from './screens/product-form';

// Until the bottom navigation of step 07, pills under the header reach the main screens.
export function App() {
  const settings = useLiveQuery(() => settingsRepo.get());
  const route = useRoute();

  return (
    <main class="screen">
      <header class="app-header">
        {settings?.logo && <LogoImage logo={settings.logo} class="header-logo" />}
        <div class="header-text">
          <h1>{settings?.businessName || he.appName}</h1>
        </div>
        {/* Its own full-width row: four pills beside a logo do not fit a 360 px screen. */}
        <nav class="top-nav">
          <a href={href({ name: 'orders' })} class={route.name.startsWith('order') ? 'on' : ''}>{he.nav.orders}</a>
          <a href={href({ name: 'customers' })} class={route.name.startsWith('customer') ? 'on' : ''}>{he.nav.customers}</a>
          <a href={href({ name: 'products' })} class={route.name.startsWith('product') ? 'on' : ''}>{he.nav.products}</a>
          <a href={href({ name: 'settings' })} class={route.name === 'settings' ? 'on' : ''}>{he.nav.settings}</a>
        </nav>
      </header>
      {route.name === 'orders' && <OrdersScreen />}
      {route.name === 'orderNew' && <OrderFormScreen />}
      {route.name === 'orderEdit' && <OrderFormScreen key={route.id} id={route.id} />}
      {route.name === 'order' && <OrderDetailScreen id={route.id} />}
      {route.name === 'customers' && <CustomersScreen />}
      {route.name === 'customerNew' && <CustomerFormScreen />}
      {route.name === 'customerEdit' && <CustomerFormScreen key={route.id} id={route.id} />}
      {route.name === 'customer' && <CustomerDetailScreen key={route.id} id={route.id} />}
      {route.name === 'products' && <ProductsScreen />}
      {route.name === 'productNew' && <ProductFormScreen />}
      {route.name === 'productEdit' && <ProductFormScreen key={route.id} id={route.id} />}
      {route.name === 'settings' && <SettingsScreen />}
    </main>
  );
}
