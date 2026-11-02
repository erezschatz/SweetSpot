import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app';
import './ui/base.css';

// autoUpdate: a new build is fetched when the app opens and runs on the next open.
registerSW({ immediate: true });

render(<App />, document.getElementById('app')!);
