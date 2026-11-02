# Setup

Read only for toolchain problems. Versions are pinned at step 01 and recorded here in the same scene.

## Machines

- **Development:** the programmer's machine (WSL2 on Windows, or macOS). Node LTS; `npm`.
- **Verification:** the programmer's Pixel 9, Chrome, installed from the Pages URL. From step 09, also the baker's Samsung Galaxy, Chrome (exact model not recorded; nothing depends on it).
- **Hosting:** GitHub Pages for the public repo `sweetspot`, deployed by `.github/workflows/pages.yml` on push to `main`.

## Pinned versions

- Node 26 (Actions and the programmer's Mac; Vite 8 needs 20.19+ or 22.12+)
- vite 8.3.5
- preact 11.1.1
- dexie 4.4.7
- dexie-react-hooks 4.4.0 (pulls `react` 19 into `node_modules` as a peer; the build aliases it to `preact/compat`)
- vite-plugin-pwa 2.0.0
- vitest 5.1.0
- Actions: checkout v7, setup-node v7, upload-pages-artifact v5, deploy-pages v5 (the v4/v3 majors ran on the deprecated Node 20 action runtime)
- typescript 7.0.2
- @preact/preset-vite 2.10.6

## Commands

```
npm ci            # install
npm run dev       # local, http://localhost:5173/SweetSpot/ (also `.claude/launch.json` "dev" for the Claude browser pane)
npm test          # vitest, src/lib only
npm run build     # dist/, base /SweetSpot/
npm run preview   # serve dist/ locally
```

## Pages specifics

- `vite.config.ts` sets `base: '/SweetSpot/'`, exactly the repo name's case (D24); the hash router means no 404 fallback is needed. `index.html` uses `%BASE_URL%` so the base is written once.
- The PWA manifest `start_url` and `scope` are the same `base`.
- Pages serves over HTTPS, which the service worker and `navigator.share` require. Local `npm run dev` on `localhost` is also a secure context; a LAN IP is not — use `adb reverse tcp:5173 tcp:5173` to test on the phone against the dev server.

## Known gotchas (to be appended as met)



- **Private repo vs. Pages.** The repo was created private. GitHub Pages from a private repository requires GitHub Pro (or Team/Enterprise); on the Free plan the Pages settings tab says so. Either make the repo public (D2's assumption; nothing in it is secret) or confirm the plan. Step 01 cannot pass until one of these is true.
- **Empty page, "this app cannot be installed".** The page loads but every asset and the manifest 404: the base path's case does not match the repo name. Pages paths are case-sensitive (D24).
- **`npm ci` noise.** `glob@11` deprecated and ~10 low/moderate audit findings, all inside `workbox-build` (build-time only; D26). `fsevents` install script denied in `package.json` `allowScripts`; its binary ships prebuilt. `vite.config.ts` imports `package.json` `with { type: 'json' }` so Vite's native config loader does not warn.
- **Pre-commit hook hangs.** `check-unit.mjs` reads stdin when it is not a TTY (that is how Claude Code hands it the hook event). `git commit` from a shell whose stdin is an open pipe, not a terminal, therefore blocked forever. `.githooks/pre-commit` now runs the script with `</dev/null`. This fix belongs in `docs/UNITIES.md` Appendix C for the next repo.
