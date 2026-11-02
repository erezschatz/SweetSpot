# 02 · Data layer and backup

## Context

**Promise.** Whatever the baker enters stays on her phone, and she can hand a copy of all of it to anywhere she likes — and get it back — with one tap each.

**Acceptance**

- [x] Dexie database with the four tables of the spec, version 1, and typed repositories in `src/db`.
- [x] `navigator.storage.persist()` requested on first run; the result is readable on the (temporary) settings screen.
- [ ] Settings screen: business name, business logo (pick from phone, resized to ≤512 px, stored as a blob, shown in the app header; remove button — D23), "Backup now", "Restore from file", last-backup date.
- [ ] "Backup now" opens the Android share sheet with `sweetspot-YYYY-MM-DD.json`; falls back to a download where `navigator.share` with files is unsupported.
- [ ] Restore replaces all tables in one transaction after a confirm; a malformed file is refused with a Hebrew message and nothing is changed.
- [x] `src/lib/backup.ts` (serialise/validate) and `src/lib/money.ts` (agorot ↔ shekels) have Vitest tests.
- [x] Backup JSON carries the logo (base64) and restore brings it back.
- [ ] Verified on the Pixel: enter a business name and a logo, back up to Drive, clear site data, restore, both are back.

## What was done

2026-11-02, programmer's Mac.

- `src/db/schema.ts`: Dexie database `sweetspot`, version 1, the four tables of the spec with their types. Only queried fields are indexed (`products.name`, `customers.name/phone`, `orders.customerId/deliveryDate/status`).
- `src/db/repositories.ts` holds `settingsRepo`, `productsRepo`, `customersRepo` and `ordersRepo`, the only way screens touch tables. A missing settings row reads as defaults. Settings writes are read-modify-write inside a transaction, because the name is saved on every keystroke and overlapping writes must not lose each other's fields. `templates` is a partial map: a missing template means "use the default", and the defaults arrive with step 04.
- `src/lib/backup.ts` (pure): the file format is `{ app, schemaVersion, exportedAt, settings, products, customers, orders }`, with the logo as `{ type, base64 }`. `parseBackup` returns `notJson`, `notSweetSpot`, `newerVersion` or `damaged`. "Damaged" covers:
  - a wrong shape for any field;
  - money, quantities or guests that are not whole and non-negative;
  - a logo that is not an image or not base64;
  - a duplicate id;
  - an order whose customer is not in the file.
  It also has chunked base64 helpers and `backupFileName`. `src/lib/dates.ts` starts with `localIsoDate` (the local day, not UTC); step 07 extends it. Tests: `backup.test.ts` 10 and `dates.test.ts` 2, 17/17 with money's 5.
- `src/db/backup.ts`: `backupNow` shares `.json`, else `.txt`, else downloads (D27). It sets `lastBackupAt` unless the sheet was closed. `restoreBackup` clears and refills all four tables in one Dexie transaction, so any failure leaves the old data.
- `src/screens/settings.tsx`, the temporary front screen, has:
  - business name, saved as she types;
  - logo pick, replace and remove;
  - last-backup date and "Backup now";
  - "Restore from file", which parses and refuses a bad file *before* the "this deletes everything" confirm, then restores and reloads;
  - whether storage is persisted;
  - the version, moved here from the old front screen.
  `src/ui/image.ts` scales a picked image to ≤512 px PNG. `src/ui/logo.tsx` shows a stored Blob and releases its URL. The header in `src/app.tsx` shows the logo and the business name, falling back to "SweetSpot", and drops step 01's placeholder lines. `src/main.tsx` calls `navigator.storage.persist()` on every start, not only the first, which is harmless once granted. `src/ui/base.css` gains header, field, input, button and message styles, in logical properties with 48 px tap targets.
- Hebrew strings in `src/i18n/he.ts`, feminine.
- `dexie-react-hooks` 4.4.0 added (already in the spec's stack table). npm installs `react` as its peer, but the built bundle contains none, since the preset aliases it. JS is now 138 kB, 47 kB gzipped, mostly Dexie.
- Docs: the backup and code-layout lines in `docs/SPEC.md`, the pin and the dev URL in `docs/SETUP.md`, D27. `.claude/launch.json` added so the Claude browser pane can start `npm run dev`.

Observed by Claude in the desktop browser pane against the dev server, not on a device:
- the screen renders RTL with no console errors;
- a typed name is stored, and four overlapping settings writes end with the last one;
- a damaged file is refused and nothing changes;
- a backup round-trips the name, a logo (byte-identical) and a customer.

Not observed: the share sheet, the file pickers, image resizing on a real photo, the restore confirm and reload. On the Pixel, check which D27 branch Chrome takes. Also check that the share sheet still opens after the database reads, since the tap's user activation could expire and turn it into a download. Not verified on a device; boxes 3, 4, 5 and 8 wait for the Pixel.
