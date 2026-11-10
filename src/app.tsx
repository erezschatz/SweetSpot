import { useLiveQuery } from 'dexie-react-hooks';
import { he } from './i18n/he';
import { settingsRepo } from './db/repositories';
import { LogoImage } from './ui/logo';
import { useRoute } from './ui/router';
import { BottomNav, SettingsGear, showsBottomNav } from './ui/bottom-nav';
import { DiaryScreen } from './screens/diary';
import { OrdersScreen } from './screens/orders';
import { OrderFormScreen } from './screens/order-form';
import { OrderDetailScreen } from './screens/order-detail';
import { SettingsScreen } from './screens/settings';
import { MoneyScreen } from './screens/money';
import { IngredientsScreen } from './screens/ingredients';
import { IngredientFormScreen } from './screens/ingredient-form';
import { ShoppingScreen } from './screens/shopping';
import { InstallScreen } from './screens/install';
import { CustomersScreen } from './screens/customers';
import { CustomerDetailScreen } from './screens/customer-detail';
import { CustomerFormScreen } from './screens/customer-form';
import { ProductsScreen } from './screens/products';
import { ProductFormScreen } from './screens/product-form';

export function App() {
  const settings = useLiveQuery(() => settingsRepo.get());
  const route = useRoute();

  const withNav = showsBottomNav(route);

  return (
    <main class={withNav ? 'screen with-nav' : 'screen'}>
      <header class="app-header">
        {settings?.logo && <LogoImage logo={settings.logo} class="header-logo" />}
        <div class="header-text">
          <h1>{settings?.businessName || he.appName}</h1>
        </div>
        <SettingsGear on={route.name === 'settings'} />
      </header>
      {route.name === 'diary' && <DiaryScreen />}
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
      {route.name === 'money' && <MoneyScreen />}
      {route.name === 'ingredients' && <IngredientsScreen />}
      {route.name === 'ingredientNew' && <IngredientFormScreen />}
      {route.name === 'ingredientEdit' && <IngredientFormScreen key={route.id} id={route.id} />}
      {route.name === 'shopping' && <ShoppingScreen />}
      {route.name === 'install' && <InstallScreen />}
      {route.name === 'settings' && <SettingsScreen />}
      {withNav && <BottomNav route={route} />}
    </main>
  );
}
