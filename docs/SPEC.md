# SweetSpot — specification

Version 0.1 (pre-code). When this file and the code disagree, fix one of them in the same scene.

## Why this project exists

A home baker selling cakes for special events tried a Hebrew subscription CRM for home bakers (`docs/PREDECESSOR.md`) for a week. The family decided the subscription is not worth it for the order volume. What she actually used and wants: a list of orders, a diary of what is due when, who paid what, and WhatsApp reminders she can send with one tap. Nothing that needs a server.

SweetSpot is that, and nothing else. It is also, openly, a learning project for the programmer: what it takes to deliver "an app" to a non-technical person who will depend on it, under the Unities, in about two weeks of evenings.

## Scope

### Phase 1 (release 1.0)

- **Products** — name and sale price. Used to fill order lines quickly. The baker enters her own catalogue at hand-off; the repo is public and ships no business data (D20). Until then, and alongside it, a line's product field also suggests every name from her past orders at the price she last charged (D29).
- **Customers** — name, phone, free-text notes, derived order history. Renaming a customer renames her orders too, since an order's title is the customer's name (D31). A customer with orders cannot be deleted.
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

- **Data** lives only in IndexedDB on the phone. `navigator.storage.persist()` is requested on every start (a no-op once granted) so Chrome does not evict it.
- **Updates** arrive through the service worker (vite-plugin-pwa, `autoUpdate`): she opens the app, it fetches the new build, next open runs it. No store, no sideloading.
- **Routing** is a hand-rolled hash router (`src/lib/route.ts`): `#/orders`, `#/orders/new`, `#/orders/:id`, `#/orders/:id/edit`, `#/customers`, `#/customers/new`, `#/customers/:id`, `#/customers/:id/edit`, `#/settings`, and later `#/products`, `#/money`. A handful of screens do not justify a router library. Until the diary (step 07), anything unknown and the empty hash go to the orders list. Saving a new order returns to the list; saving an edit returns to that order (D29). Leaving a form steps back in history when the target is the screen she was on just before, and otherwise replaces the form's entry, so Back does not reopen a saved form. The order detail and the customer card end with one row of actions, "back to the list" last, at the far end (D33): with the payment buttons on an order, and with Delete on a customer.
- **Keyboard**: the viewport resizes with the on-screen keyboard (`interactive-widget=resizes-content`). A sticky save bar sits at the bottom of forms, so `src/ui/keyboard.ts` scrolls the focused field clear of the bar once the keyboard is open, by the amount `src/lib/keyboard.ts` works out. `scroll-padding-block-end` covers the same for the browser's own scrolling (D32).
- **State**: Dexie's live queries (`useLiveQuery`) feed screens directly. No global store.
- **WhatsApp**: four plain links to `https://wa.me/<number>?text=<encoded>` on the order detail (`src/ui/whatsapp-buttons.tsx`), which Android hands to the WhatsApp app (D30). The customer's phone is kept as typed and normalised at send time in `src/lib/phone.ts`: any usual Israeli form becomes `972` plus the number without its leading 0 (`9725xxxxxxxx` for a mobile), direction marks from pasted text are ignored, a foreign number written with `+` or `00` is kept, and anything else shows a Hebrew note instead of the buttons. The message is her template from settings, or the default in `src/i18n/he.ts`, filled by `src/lib/template.ts`. An emptied template counts as no template. A placeholder with nothing to say (no guests or event date, ₪0 total, paid or owed, no business name) is empty, and a template line holding one is left out. The payment reminder is offered only while something is owed.
- **Contacts**: `navigator.contacts.select(['name', 'tel'], { multiple: false })` behind a user gesture; feature-detected (`'contacts' in navigator && 'select' in navigator.contacts`). Returns only the picked contact; nothing is stored beyond the customer row it fills. Of several numbers, an Israeli mobile is taken. In the order form, a picked contact whose number is already on file selects that customer instead of creating a second one (D31).
- **Backup**: `navigator.share({ files: [sweetspot-YYYY-MM-DD.json] })`; if Chrome will not share a `.json`, the same content as `sweetspot-YYYY-MM-DD.txt`; if neither, a download (D27). The file is versioned JSON (`app`, `schemaVersion`, `exportedAt`, the settings row with the logo as base64, and the three tables). Closing the share sheet does not count as a backup. Import accepts `.json` and `.txt`, validates every row, unique ids and order→customer links (`src/lib/backup.ts`) before asking to replace anything, refuses a newer `schemaVersion`, replaces all tables inside one Dexie transaction, and reloads the app.
- **Code layout**: `src/db/schema.ts` (Dexie tables, version 1), `src/db/repositories.ts` (the only way screens touch tables), `src/db/backup.ts` (file I/O around the pure `src/lib/backup.ts`).

## Data model

All ids are `crypto.randomUUID()`. Dates are ISO `YYYY-MM-DD` strings; timestamps are ISO datetimes. Money is integer agorot (₪1 = 100) to avoid float drift; the UI shows shekels.

| Table | Fields |
|---|---|
| `settings` (single row, id `'me'`) | `businessName`, `logo?` (Blob, ≤512 px, D23), `templates: { accepted, reminder, ready, payment }` (strings with `{name} {items} {guests} {eventDate} {deliveryDate} {total} {paid} {owes} {business}` placeholders), `lastBackupAt?`, `schemaVersion` |
| `products` | `id`, `name`, `price` (agorot), `active` (bool), `createdAt` |
| `customers` | `id`, `name`, `phone` (as typed), `notes`, `createdAt` |
| `orders` | `id`, `customerId`, `title` (the customer's name at save; no separate field yet, D28), `items: [{ productId?, name, qty, unitPrice, details }]`, `guests?` (number), `eventDate?`, `deliveryDate`, `fulfilment: 'pickup' \| 'delivery'`, `address?`, `designNotes`, `status: 'new' \| 'confirmed' \| 'delivered' \| 'cancelled'`, `total` (agorot, stored, recomputed on save), `paidAmount` (agorot), `paidAt?`, `paidMethod?: 'cash' \| 'bit' \| 'paybox' \| 'transfer' \| 'other'`, `deposit?` (agorot), `depositPaidAt?`, `depositMethod?`, `notes`, `createdAt`, `updatedAt` |

Derived, never stored: customer order history (query orders by `customerId`); paid-so-far = `(depositPaidAt ? deposit : 0) + (paidAt ? paidAmount : 0)`; outstanding = `total − paid-so-far`, shown as "owes" only once `status = delivered`; month income = deposits and payments whose paid-at falls in the month; the *paid* badge = something paid and outstanding ≤ 0 (a free order is never "paid"); a cancelled order shows no badge (`src/lib/orders.ts`).

Her own notation, which the form and the order card must read as naturally as her notebook does: `דנה לוי- עוגת פרחים, 4 שכבות, שוקולד +שוקולד- פרווה` → customer *דנה לוי*, line *עוגת פרחים* with details *4 שכבות, שוקולד + שוקולד, פרווה*.

What she juggles on the phone with a customer — event date, number of guests, cake size against the guests, design, flavours — maps to `eventDate`, `guests`, the product and its `details`, `designNotes`. The *order accepted* message echoes exactly these so the customer confirms the same things she wrote down.

## Stack

| Dependency | What it replaces | Why it is rote |
|---|---|---|
| TypeScript | — | The programmer's language. |
| Vite | hand-written bundling | Standard; `base` set to `/SweetSpot/` for Pages, matching the repo name's case (D24). |
| Preact (+ `preact/hooks`) | React | Same mental model as React, 4 kB, no need for React's weight in a five-screen app. |
| Dexie (+ `dexie-react-hooks`, works with Preact's compat; npm installs `react` as its peer, but `@preact/preset-vite` aliases it to `preact/compat`, so none ships) | raw IndexedDB | Schema versioning, live queries, transactions; raw IDB is boilerplate the programmer does not want to own. |
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
- Deployed URL: `https://erezschatz.github.io/SweetSpot/` (case-sensitive path; D24).
- Her data never touches the repo or the host. The host serves static files and nothing else.

## Verification

Every step is verified on an Android phone, installed from the Pages URL, not in a desktop browser. The programmer's Pixel 9 during development; her Samsung Galaxy with Chrome at hand-off (D21). Desktop Chrome with device emulation is fine for layout work mid-step but does not count as verification.
