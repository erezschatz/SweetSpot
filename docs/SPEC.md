# SweetSpot — specification

Version 0.1 (pre-code). When this file and the code disagree, fix one of them in the same scene.

## Why this project exists

A home baker selling cakes for special events tried a Hebrew subscription CRM for home bakers (`docs/PREDECESSOR.md`) for a week. The family decided the subscription is not worth it for the order volume. What she actually used and wants: a list of orders, a diary of what is due when, who paid what, and WhatsApp reminders she can send with one tap. Nothing that needs a server.

SweetSpot is that, and nothing else. It is also, openly, a learning project for the programmer: what it takes to deliver "an app" to a non-technical person who will depend on it, under the Unities, in about two weeks of evenings.

## Scope

### Phase 1 (release 1.0)

- **Products** — name and sale price. Used to fill order lines quickly. The baker enters her own catalogue at hand-off; the repo is public and ships no business data (D20).
- **Customers** — name, phone, free-text notes, derived order history.
- **Orders** — customer, one or more lines (product or free text, qty, unit price, one free-text details line in her own notation), event date, delivery date, pickup/delivery, number of guests, design notes, status, total, payment (after delivery; optional deposit).
- **Diary** — the front screen: today, this week, next week, as a list of orders by delivery date. A week grid is explicitly *not* required; a list grouped by day is.
- **Money** — this month's income (payments dated this month), outstanding balances (delivered and not fully paid).
- **WhatsApp** — four buttons on an order: *order accepted* (the written summary the customer confirms), *reminder before delivery*, *ready*, *payment reminder*. Each opens WhatsApp with a Hebrew message filled from an editable template. The customer's reply is recorded by the baker tapping a status or a payment, not by the app.
- **Contacts** — a new customer can be picked from the phone's contacts (Contact Picker API; D18), name and number filled in.
- **Backup/restore** — one-tap JSON export through the Android share sheet; import from a file. A nag on the front screen when the last backup is older than 14 days.
- **Install** — PWA, add-to-home-screen, works offline, persistent storage requested.

### Not phase 1 (see `docs/PLAN.md` and D3–D9)

Ingredients and costing, branded quotes, customer approve-by-link, public landing page, calendar sync, push notifications, multi-device sync, cloud backup, login, iOS, tablet layout, English UI, printing/PDF, invoices.

## Architecture

One static site. No server component at all; the hosting is a file server (GitHub Pages).

```
GitHub repo ──(Actions on push to main)──► GitHub Pages ──► Chrome on her phone
                                                               │
                                                        installed PWA
                                                               │
                                                          IndexedDB (Dexie)
                                                               │
                                                    share sheet ◄─ backup JSON
```

- **Data** lives only in IndexedDB on the phone. `navigator.storage.persist()` is requested on first run so Chrome does not evict it.
- **Updates** arrive through the service worker (vite-plugin-pwa, `autoUpdate`): she opens the app, it fetches the new build, next open runs it. No store, no sideloading.
- **Routing** is a hand-rolled hash router (`#/orders`, `#/orders/:id`, `#/customers`, `#/products`, `#/money`, `#/settings`). Five screens do not justify a router library.
- **State**: Dexie's live queries (`useLiveQuery`) feed screens directly. No global store.
- **WhatsApp**: `https://wa.me/<E.164>?text=<encoded>`; opened with `window.open`. Israeli numbers are normalised from `05x-xxxxxxx` to `9725xxxxxxxx` in `src/lib/phone.ts`.
- **Contacts**: `navigator.contacts.select(['name', 'tel'], { multiple: false })` behind a user gesture; feature-detected (`'contacts' in navigator && 'select' in navigator.contacts`). Returns only the picked contact; nothing is stored beyond the customer row it fills.
- **Backup**: `navigator.share({ files: [sweetspot-YYYY-MM-DD.json] })` with a download fallback. Import reads the file, validates the schema version, replaces all tables inside one Dexie transaction.

## Data model

All ids are `crypto.randomUUID()`. Dates are ISO `YYYY-MM-DD` strings; timestamps are ISO datetimes. Money is integer agorot (₪1 = 100) to avoid float drift; the UI shows shekels.

| Table | Fields |
|---|---|
| `settings` (single row, id `'me'`) | `businessName`, `logo?` (Blob, ≤512 px, D23), `templates: { accepted, reminder, ready, payment }` (strings with `{name} {items} {guests} {eventDate} {deliveryDate} {total} {paid} {owes} {business}` placeholders), `lastBackupAt?`, `schemaVersion` |
| `products` | `id`, `name`, `price` (agorot), `active` (bool), `createdAt` |
| `customers` | `id`, `name`, `phone` (as typed), `notes`, `createdAt` |
| `orders` | `id`, `customerId`, `title` (defaults to the customer's name), `items: [{ productId?, name, qty, unitPrice, details }]`, `guests?` (number), `eventDate?`, `deliveryDate`, `fulfilment: 'pickup' \| 'delivery'`, `address?`, `designNotes`, `status: 'new' \| 'confirmed' \| 'delivered' \| 'cancelled'`, `total` (agorot, stored, recomputed on save), `paidAmount` (agorot), `paidAt?`, `paidMethod?: 'cash' \| 'bit' \| 'paybox' \| 'transfer' \| 'other'`, `deposit?` (agorot), `depositPaidAt?`, `depositMethod?`, `notes`, `createdAt`, `updatedAt` |

Derived, never stored: customer order history (query orders by `customerId`); paid-so-far = `(depositPaidAt ? deposit : 0) + (paidAt ? paidAmount : 0)`; outstanding = `total − paid-so-far`, shown as "owes" only once `status = delivered`; month income = deposits and payments whose paid-at falls in the month; the *paid* badge = outstanding ≤ 0.

Her own notation, which the form and the order card must read as naturally as her notebook does: `דנה לוי- עוגת פרחים, 4 שכבות, שוקולד +שוקולד- פרווה` → customer *דנה לוי*, line *עוגת פרחים* with details *4 שכבות, שוקולד + שוקולד, פרווה*.

What she juggles on the phone with a customer — event date, number of guests, cake size against the guests, design, flavours — maps to `eventDate`, `guests`, the product and its `details`, `designNotes`. The *order accepted* message echoes exactly these so the customer confirms the same things she wrote down.

## Stack

| Dependency | What it replaces | Why it is rote |
|---|---|---|
| TypeScript | — | The programmer's language. |
| Vite | hand-written bundling | Standard; `base` set to `/sweetspot/` for Pages. |
| Preact (+ `preact/hooks`) | React | Same mental model as React, 4 kB, no need for React's weight in a five-screen app. |
| Dexie (+ `dexie-react-hooks`, works with Preact's compat) | raw IndexedDB | Schema versioning, live queries, transactions; raw IDB is boilerplate the programmer does not want to own. |
| vite-plugin-pwa | hand-written manifest + service worker | Generates both, handles update strategy. |
| Vitest | — | Tests for `src/lib`. Same config as Vite. |
| GitHub Actions `actions/deploy-pages` | manual upload | Push to `main` → deployed. |

No CSS framework, no component library, no router, no date library (`Intl` and ISO strings suffice), no state library.

## Hebrew and RTL

- `lang="he" dir="rtl"` on `<html>`. System font stack; no web font download.
- Numbers and dates render through `Intl.NumberFormat('he-IL')` / `Intl.DateTimeFormat('he-IL')`.
- Minimum tap target 48 px. One-handed: primary actions at the bottom.
- Light theme only.

## Hosting and repo

- Public GitHub repo (GitHub Pages on a private repo requires a paid plan; D11).
- Deployed URL: `https://<user>.github.io/sweetspot/`.
- Her data never touches the repo or the host. The host serves static files and nothing else.

## Verification

Every step is verified on an Android phone, installed from the Pages URL, not in a desktop browser. The programmer's Pixel 9 during development; her Samsung Galaxy with Chrome at hand-off (D21). Desktop Chrome with device emulation is fine for layout work mid-step but does not count as verification.
