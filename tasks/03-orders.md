# 03 · Orders

## Context

**Promise.** The baker writes down an order the way she already does in her notebook — `דנה לוי- עוגת פרחים, 4 שכבות, שוקולד +שוקולד- פרווה`, for when, for how many people, for how much — and finds it again in a list that shows at a glance where each order stands and whether it was paid.

**Acceptance**

- [ ] Orders list: one card per order — title (customer's name by default), first line's product and details, delivery date, status, total, and a *paid* / *owes* badge; sorted by delivery date; delivered and cancelled hidden by default behind a toggle.
- [ ] New/edit order form, top to bottom: customer (pick existing by name/phone, or new — see step 05 for contacts), lines (product from the catalogue or free text; qty; unit price prefilled from the product; one details line), delivery date, pickup/delivery (+ address), event date, number of guests, design notes, notes. Total recomputed live. Deposit hidden behind "add deposit" (amount, paid date, method).
- [ ] Order detail: everything above, plus status buttons (confirm / delivered / cancel) and one payment tap: "paid" → amount (defaults to outstanding), method (cash / bit / PayBox / transfer / other), today's date, all editable.
- [ ] Entering her notebook example takes under a minute on the phone, one-handed.
- [ ] All strings in `src/i18n/he.ts`; tap targets ≥ 48 px.
- [x] `src/lib/orders.ts` (total, paid-so-far, outstanding, paid badge) has Vitest tests.
- [ ] Verified on the Pixel with three real-shaped orders, one with a deposit.

## What was done

2026-11-02, programmer's Mac.

**Pure logic, all tested (58 tests in all, 41 new):**
- `src/lib/orders.ts`: line and order totals, paid-so-far, outstanding, the badge, the list order and filter, which status moves are offered, and recording or clearing the final payment.
  - The badge is *owes* only once delivered and *paid* only when something was paid and nothing is left. A cancelled order has no badge, and a free order is never "paid".
  - The list sorts by delivery date, then by when the order was entered.
- `src/lib/order-draft.ts`: the form edits text, so validating that text and turning it into an `Order` lives here.
  - A blank spare line is ignored.
  - An empty price is allowed, for a price agreed later. A price that isn't a number, or is negative, is refused, as is a quantity or guests that isn't whole.
  - On edit, status, the final payment and `createdAt` are kept, and the total is recomputed.
  - Order → form → order round-trips unchanged.
- Smaller pieces: `src/lib/customers.ts` (search by part of a name or a few digits, with 972 and 05x matching each other), `src/lib/route.ts` (hash routes and their inverse), `src/lib/dates.ts` (`parseIsoDate` at local midnight and `formatDay` in Hebrew), and `src/lib/money.ts` (`agorotToInput`).

**Screens:**
- `src/screens/orders.tsx`: one card per order showing the title, the first line with its details and "+N more", the delivery day, total, status and the paid/owes badge. A toggle shows delivered and cancelled orders. "New order" is a floating button on the thumb side.
- `src/screens/order-form.tsx`, top to bottom:
  - the customer (`src/ui/customer-picker.tsx`: search existing, or "new customer" carrying over what she typed as a name or a phone);
  - lines (product with catalogue suggestions, qty, unit price, details, add and remove);
  - a live total;
  - delivery date, pickup or delivery (with an address), event date, guests, design and notes;
  - "add deposit", which opens the amount, the paid date (prefilled today) and the method.
  Errors are listed in Hebrew above a sticky save bar.
- `src/screens/order-detail.tsx`:
  - everything on the order;
  - status buttons (D28);
  - payment: total, deposit, final payment, paid so far and outstanding;
  - "paid", which opens amount (prefilled with what is owed), date (today) and method chips, plus edit and clear payment.
- Supporting files: `src/ui/router.ts` (`useRoute`, `navigate`), `src/ui/badges.tsx`, and header links to orders and settings until step 07's bottom navigation, in `src/app.tsx`. Those links replace the tagline under the name. Orders are the front screen for now.
- Saving writes a new customer and the order in one transaction (`ordersRepo.saveWithCustomer`), so a failed save leaves no orphan customer and shows a Hebrew error. The save button is disabled while saving, so a double tap does not create two orders.
- A catalogue price replaces the previous product's price when she switches product, but never a price she typed herself.
- A ₪0 payment is refused; "cancel payment" is the way back.
- Styles in `src/ui/base.css`:
  - New: cards, badges, segmented buttons, sticky actions and the floating button, in logical properties with 48 px minimum heights.
  - Changed for every screen, settings included: inputs, selects and textareas share one style at full width; there are `h3` and link rules; and every `section` gets 96 px of bottom padding, so the floating button never covers the last card. Cancelled cards are dimmed; delivered ones are not, so an owing badge stays loud.
- `docs/SPEC.md`: routes, title = customer name, and the badge rule as coded. D28 records the status moves, the title, catalogue suggestions and "לקוח".

**Observed by Claude** in the browser pane at 375×812 against the dev server, not on a device. Her notebook example (new customer with a phone, the line with its details, delivery and event dates, 30 guests, a ₪100 deposit by bit) saved as expected. The detail showed ₪220 outstanding. Marking it delivered showed a "owes ₪220" badge on the card. "Paid" was prefilled with 220 and today; with cash, the badge became "paid". Editing qty to 2 kept the status and payment, made the total ₪640, and created no second customer. A backup holding these orders still passes `parseBackup`. After the review fixes: a double-tapped save of a new order with a new customer made one order and one customer, and a ₪0 payment was refused with the Hebrew error and nothing saved. Not observed: the one-handed under-a-minute entry, the datalist with a real catalogue (empty until step 06), and the Android date picker. Tap-target size is unmeasured: the box stays open for the Pixel and the baker (`CLAUDE.md`). Not verified on a device; boxes 1–5 and 7 wait for the Pixel.
