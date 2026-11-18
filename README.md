# SweetSpot

An order book for one home baker, as an installable web app. Hebrew only, built for an Android phone.

It keeps her orders, a diary of what is due when, who paid what, WhatsApp messages she sends in one tap, and what each cake costs her in materials. There is no server, no login and no sync: everything lives in the phone's browser storage (IndexedDB), and backups are a JSON file she shares to wherever she likes.

The live build is served from GitHub Pages at <https://erezschatz.github.io/SweetSpot/>. Open it in Chrome on Android and add it to the home screen.

The repository holds code only. Her customers, orders, products and prices never enter it.

## Running it

Node 26 and npm.

```
npm ci            # install
npm run dev       # http://localhost:5173/SweetSpot/
npm test          # Vitest, pure logic in src/lib and src/db
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
```

Pushing to `main` builds and deploys to Pages (`.github/workflows/pages.yml`). Toolchain notes and known problems are in [docs/SETUP.md](docs/SETUP.md).

## Stack

Preact, Vite, Dexie over IndexedDB, vite-plugin-pwa for the service worker, Vitest. The full table, with why each is there, is in [docs/SPEC.md](docs/SPEC.md).

## How the work is recorded

This is also a learning project in delivering an app to a non-technical person who depends on it, worked on with Claude Code. Every change carries its record:

- [docs/SPEC.md](docs/SPEC.md): what the app is and what is cut.
- [docs/DECISIONS.md](docs/DECISIONS.md): what was chosen, and what was rejected.
- [docs/PLAN.md](docs/PLAN.md) and [tasks/](tasks/): the ordered steps and what was done in each.
- [CLAUDE.md](CLAUDE.md) and [docs/working-on-a-task.md](docs/working-on-a-task.md): how to work here.

`CHANGELOG.md` is compiled from the task files at release and never edited by hand.

## License

[MIT](LICENSE).
