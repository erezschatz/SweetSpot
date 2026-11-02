# 01 · Toolchain green

## Context

**Promise.** An empty SweetSpot — just the name on a light screen — opens full-screen from its own icon on the programmer's phone, served from GitHub Pages, and `npm test` passes.

**Acceptance**

- [ ] `npm ci && npm test && npm run build` succeed on the programmer's machine; versions pinned in `docs/SETUP.md`.
- [ ] Push to `main` deploys to `https://erezschatz.github.io/SweetSpot/` by Actions.
- [ ] On the Pixel: Chrome offers "Install" (current Chrome's name for Add to Home screen); the icon opens the app without an address bar; airplane mode, reopen — still opens.
- [x] `<html lang="he" dir="rtl">`, light theme colour in the manifest, 192/512 icons present.
- [x] One Vitest test exists and runs (a placeholder in `src/lib`).

## What was done

2026-11-02, cloud session. Vite 6 + Preact + Dexie + vite-plugin-pwa + Vitest scaffolded; `base: '/sweetspot/'`, manifest with `lang: he`, `dir: rtl`, light theme colour, 192/512 icons (generated: cream rounded square, cocoa dot — original, placeholder until a real one is wanted), workbox precaches the whole build. `src/lib/money.ts` is the first real `src/lib` unit (agorot ↔ shekels, D14) with 5 tests. `.github/workflows/pages.yml` builds, tests and deploys on push to `main`. `__APP_VERSION__` is injected from `package.json` for the settings screen later. Versions pinned in `docs/SETUP.md`.

`npm test` 5/5 and `npm run build` green in the container (14 kB JS gzipped 6 kB). The Vite config imports `defineConfig` from `vitest/config` so the `test` block type-checks.

Owed to the programmer: the Pages source set to "GitHub Actions" in the repo settings (and the private-repo question in `docs/SETUP.md` settled), the first deploy, and the phone acceptance boxes. verified 2026-11-02, cloud container (build and tests only, no device), Claude.

## What was done

2026-11-02, on the programmer's Mac. The first deploy succeeded once the Pages source was set, but the Pixel showed an empty page and Chrome said "this app cannot be installed": Pages serves the repo at `/SweetSpot/` and 404s `/sweetspot/`, so every asset and the manifest were missing. `base`, `start_url` and `scope` are now one `/SweetSpot/` constant in `vite.config.ts`, and `index.html` uses `%BASE_URL%` instead of repeating it (D24; renaming the repo was the rejected alternative).

Same change, D24: Vite 6.4.5 → 8.3.5 and Vitest 5.0.5 → 5.1.0. Vite 6 was the container's default, not a choice. Actions moved to Node 26 for the build, and to checkout v7, setup-node v7, upload-pages-artifact v5 and deploy-pages v5, which clears Actions' Node 20 deprecation warning. Acceptance wording updated to the real URL and to current Chrome's "Install". `docs/SETUP.md` and the `docs/SPEC.md` stack table and URL follow.

D25 in the same change: Claude writes the verification line from the programmer's report; `CLAUDE.md`'s division of labour says so. `docs/SETUP.md` gains the empty-page gotcha.

`npm ci`, `npm test` and `npm run build` were reported green by the programmer on Vite 6. The upgrade replaced esbuild with rolldown and lightningcss in the lockfile, so box 1 is open again until he reruns all three on Vite 8. Also not yet seen: the deploy on the new action versions, and the three phone checks (install, no address bar, airplane mode). verified 2026-11-02, programmer's Mac (Vite 6 build and tests only, no device), Erez.
