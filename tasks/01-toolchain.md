# 01 · Toolchain green

## Context

**Promise.** An empty SweetSpot — just the name on a light screen — opens full-screen from its own icon on the programmer's phone, served from GitHub Pages, and `npm test` passes.

**Acceptance**

- [ ] `npm ci && npm test && npm run build` succeed on the programmer's machine; versions pinned in `docs/SETUP.md`.
- [ ] Push to `main` deploys to `https://<user>.github.io/sweetspot/` by Actions.
- [ ] On the Pixel: Chrome offers "Add to Home screen"; the icon opens the app without an address bar; airplane mode, reopen — still opens.
- [ ] `<html lang="he" dir="rtl">`, light theme colour in the manifest, 192/512 icons present.
- [ ] One Vitest test exists and runs (a placeholder in `src/lib`).

## What was done

2026-11-02, cloud session. Vite 6 + Preact + Dexie + vite-plugin-pwa + Vitest scaffolded; `base: '/sweetspot/'`, manifest with `lang: he`, `dir: rtl`, light theme colour, 192/512 icons (generated: cream rounded square, cocoa dot — original, placeholder until a real one is wanted), workbox precaches the whole build. `src/lib/money.ts` is the first real `src/lib` unit (agorot ↔ shekels, D14) with 5 tests. `.github/workflows/pages.yml` builds, tests and deploys on push to `main`. `__APP_VERSION__` is injected from `package.json` for the settings screen later. Versions pinned in `docs/SETUP.md`.

`npm test` 5/5 and `npm run build` green in the container (14 kB JS gzipped 6 kB). The Vite config imports `defineConfig` from `vitest/config` so the `test` block type-checks.

Owed to the programmer: the Pages source set to "GitHub Actions" in the repo settings (and the private-repo question in `docs/SETUP.md` settled), the first deploy, and the phone acceptance boxes. verified 2026-11-02, cloud container (build and tests only, no device), Claude.
