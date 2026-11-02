# 02 · Data layer and backup

## Context

**Promise.** Whatever the baker enters stays on her phone, and she can hand a copy of all of it to anywhere she likes — and get it back — with one tap each.

**Acceptance**

- [ ] Dexie database with the four tables of the spec, version 1, and typed repositories in `src/db`.
- [ ] `navigator.storage.persist()` requested on first run; the result is readable on the (temporary) settings screen.
- [ ] Settings screen: business name, "Backup now", "Restore from file", last-backup date.
- [ ] "Backup now" opens the Android share sheet with `sweetspot-YYYY-MM-DD.json`; falls back to a download where `navigator.share` with files is unsupported.
- [ ] Restore replaces all tables in one transaction after a confirm; a malformed file is refused with a Hebrew message and nothing is changed.
- [ ] `src/lib/backup.ts` (serialise/validate) and `src/lib/money.ts` (agorot ↔ shekels) have Vitest tests.
- [ ] Verified on the Pixel: enter a business name, back up to Drive, clear site data, restore, name is back.
