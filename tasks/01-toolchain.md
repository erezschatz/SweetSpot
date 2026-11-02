# 01 · Toolchain green

## Context

**Promise.** An empty SweetSpot — just the name on a light screen — opens full-screen from its own icon on the programmer's phone, served from GitHub Pages, and `npm test` passes.

**Acceptance**

- [ ] `npm ci && npm test && npm run build` succeed on the programmer's machine; versions pinned in `docs/SETUP.md`.
- [ ] Push to `main` deploys to `https://<user>.github.io/sweetspot/` by Actions.
- [ ] On the Pixel: Chrome offers "Add to Home screen"; the icon opens the app without an address bar; airplane mode, reopen — still opens.
- [ ] `<html lang="he" dir="rtl">`, light theme colour in the manifest, 192/512 icons present.
- [ ] One Vitest test exists and runs (a placeholder in `src/lib`).
