# 03 · Orders

## Context

**Promise.** The baker writes down an order the way she already does in her notebook — `דנה לוי- עוגת פרחים, 4 שכבות, שוקולד +שוקולד- פרווה`, for when, for how many people, for how much — and finds it again in a list that shows at a glance where each order stands and whether it was paid.

**Acceptance**

- [ ] Orders list: one card per order — title (customer's name by default), first line's product and details, delivery date, status, total, and a *paid* / *owes* badge; sorted by delivery date; delivered and cancelled hidden by default behind a toggle.
- [ ] New/edit order form, top to bottom: customer (pick existing by name/phone, or new — see step 05 for contacts), lines (product from the catalogue or free text; qty; unit price prefilled from the product; one details line), delivery date, pickup/delivery (+ address), event date, number of guests, design notes, notes. Total recomputed live. Deposit hidden behind "add deposit" (amount, paid date, method).
- [ ] Order detail: everything above, plus status buttons (confirm / delivered / cancel) and one payment tap: "paid" → amount (defaults to outstanding), method (cash / bit / PayBox / transfer / other), today's date, all editable.
- [ ] Entering her notebook example takes under a minute on the phone, one-handed.
- [ ] All strings in `src/i18n/he.ts`; tap targets ≥ 48 px.
- [ ] `src/lib/orders.ts` (total, paid-so-far, outstanding, paid badge) has Vitest tests.
- [ ] Verified on the Pixel with three real-shaped orders, one with a deposit.
