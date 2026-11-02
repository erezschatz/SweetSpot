import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { version } from './package.json';

// base is the repo name because GitHub Pages serves a project site under it.
export default defineConfig({
  base: '/sweetspot/',
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-512-maskable.png'],
      manifest: {
        name: 'SweetSpot',
        short_name: 'SweetSpot',
        description: 'יומן ההזמנות שלך',
        lang: 'he',
        dir: 'rtl',
        start_url: '/sweetspot/',
        scope: '/sweetspot/',
        display: 'standalone',
        background_color: '#FBF8F3',
        theme_color: '#FBF8F3',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Everything the build emits is precached, so the app opens offline.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
