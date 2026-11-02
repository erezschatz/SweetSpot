import { useLiveQuery } from 'dexie-react-hooks';
import { he } from './i18n/he';
import { settingsRepo } from './db/repositories';
import { LogoImage } from './ui/logo';
import { SettingsScreen } from './screens/settings';

// Step 02: the header and the settings screen. Routing arrives with the steps that need it.
export function App() {
  const settings = useLiveQuery(() => settingsRepo.get());

  return (
    <main class="screen">
      <header class="app-header">
        {settings?.logo && <LogoImage logo={settings.logo} class="header-logo" />}
        <div>
          <h1>{settings?.businessName || he.appName}</h1>
          <p class="muted">{he.tagline}</p>
        </div>
      </header>
      <SettingsScreen />
    </main>
  );
}
