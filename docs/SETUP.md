# Setup

Read only for toolchain problems. Versions are pinned at step 01 and recorded here in the same scene.

## Machines

- **Development:** the programmer's machine (WSL2 on Windows, or macOS). Node LTS; `npm`.
- **Verification:** the programmer's Pixel 9, Chrome, installed from the Pages URL. From step 09, also the baker's Samsung Galaxy, Chrome (exact model not recorded; nothing depends on it).
- **Hosting:** GitHub Pages for the public repo `sweetspot`, deployed by `.github/workflows/pages.yml` on push to `main`.

## Pinned versions

- Node 22 (Actions and the container; any 20+ should do)
- vite 6.4.5
- preact 11.1.1
- dexie 4.4.7
- vite-plugin-pwa 2.0.0
- vitest 5.0.5
- typescript 7.0.2
- @preact/preset-vite 2.10.6

## Commands

```
npm ci            # install
npm run dev       # local, http://localhost:5173
npm test          # vitest, src/lib only
npm run build     # dist/, base /sweetspot/
npm run preview   # serve dist/ locally
```

## Pages specifics

- `vite.config.ts` sets `base: '/sweetspot/'`; the hash router means no 404 fallback is needed.
- The PWA manifest `start_url` and `scope` must be `/sweetspot/`.
- Pages serves over HTTPS, which the service worker and `navigator.share` require. Local `npm run dev` on `localhost` is also a secure context; a LAN IP is not — use `adb reverse tcp:5173 tcp:5173` to test on the phone against the dev server.

## Known gotchas (to be appended as met)



- **Private repo vs. Pages.** The repo was created private. GitHub Pages from a private repository requires GitHub Pro (or Team/Enterprise); on the Free plan the Pages settings tab says so. Either make the repo public (D2's assumption; nothing in it is secret) or confirm the plan. Step 01 cannot pass until one of these is true.
- **Pre-commit hook hangs.** `check-unit.mjs` reads stdin when it is not a TTY (that is how Claude Code hands it the hook event). `git commit` from a shell whose stdin is an open pipe, not a terminal, therefore blocked forever. `.githooks/pre-commit` now runs the script with `</dev/null`. This fix belongs in `docs/UNITIES.md` Appendix C for the next repo.
