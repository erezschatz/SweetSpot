import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app';
import { keepFocusedFieldVisible } from './ui/keyboard';
import './ui/base.css';

// Ask Chrome not to evict her data under storage pressure. Installed PWAs are usually
// granted this silently; asking on every start is harmless once granted.
void navigator.storage?.persist?.();

// autoUpdate: a new build is fetched when the app opens and runs on the next open.
registerSW({ immediate: true });

keepFocusedFieldVisible();

render(<App />, document.getElementById('app')!);
