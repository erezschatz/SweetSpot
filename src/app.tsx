import { he } from './i18n/he';
import { formatShekels } from './lib/money';

// Step 01: a blank SweetSpot. Screens and routing arrive with the steps that need them.
export function App() {
  return (
    <main class="screen">
      <h1>{he.appName}</h1>
      <p class="muted">{he.tagline}</p>
      <p class="muted">{he.version} {__APP_VERSION__} · {formatShekels(0)}</p>
    </main>
  );
}
