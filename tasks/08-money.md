# 08 · Money

## Context

**Promise.** The baker sees how much came in this month and exactly who still owes her what — without opening a single order.

**Acceptance**

- [ ] Money screen: this month's income (payments dated this month), previous month for comparison, and a list of delivered orders with an outstanding balance (customer, amount, delivery date, tap → order, tap → WhatsApp payment reminder).
- [ ] Income counts a deposit on its `depositPaidAt` month and the payment on its `paidAt` month; cancelled orders' paid deposits still count as income.
- [ ] `src/lib/money.ts` extended with month totals; tested.
- [ ] Verified on the Pixel against a hand-calculated set of five orders.

## What was done

2026-11-08, programmer's Mac. The choices made along the way are D40.

**Pure logic, all tested (128 tests in all, 7 new):**
- `src/lib/money.ts`:
  - `monthOf` and `previousMonth`, months as `YYYY-MM`, January stepping back to December;
  - `monthIncome(orders, month)`: a deposit in the month of `depositPaidAt`, the payment in the month of `paidAt`, no status asked (D40). Tests: a deposit and a payment in different months, amounts with no date, the first and last day of a month, a cancelled order's deposit.
- `src/lib/orders.ts`: `owingOrders`, the delivered orders still owing, oldest delivery first. The diary's delivered-not-paid line now uses it too, so the two lists cannot drift apart. Tested with paid, open, cancelled and free orders left out.
- `src/lib/dates.ts`: `formatMonth`, "נובמבר 2026" via `Intl`.
- `src/lib/route.ts`: `#/money`.

**Screens:**
- `src/screens/money.tsx`:
  - two figures, this month and last, each with its month's name, and a line saying they count deposits and payments by the day they were paid;
  - "נמסרו ועוד לא שולמו" with the total owed;
  - one card per order (customer name, what is left, delivery date) that opens the order, and a green "תזכורת בוואטסאפ" button under it;
  - with nothing owed, a line saying so.
  - The month is read when the screen renders, not on a timer, unlike the diary's today.
- `src/ui/whatsapp-buttons.tsx`: a `messageLink` helper, and `paymentReminderLink`, the payment template filled for one order. It gives nothing when the customer has no usable number or nothing is owed, and the row then has no button; the order detail says why. The four buttons on an order share its link builder.
- `src/ui/bottom-nav.tsx`: the money tab, fifth (D39).
- `src/ui/router.ts`: `startedFrom()` knows the money screen. `src/screens/order-detail.tsx`: the back button reads "למסך הכסף" there. The order form reads `startedFrom()` too, but the money screen has no new-order button, so a new order never returns there.
- `src/ui/bottom-nav.tsx`: its comment now says money is in the bar.
- `src/i18n/he.ts`: `nav.money`, the `money` block and `orders.backToMoney`. CSS for the two figures and the rows.
- `docs/SPEC.md`: money, navigation, routes and the month-income rule. D40.

**Observed by Claude** in the browser pane at 360×780 against the dev server, not on a device. The pane's earlier test data was set aside, and put back afterwards. Six orders on Sunday 2026-11-08, worked out by hand first:
- delivered, ₪300 paid 3 Nov;
- delivered, ₪400 with a ₪100 deposit paid 25 Oct;
- cancelled, ₪50 deposit paid 1 Nov;
- delivered, ₪250 paid 30 Oct;
- confirmed, ₪80 deposit paid 5 Nov;
- delivered, ₪200, nothing paid.

The screen showed November ₪430 and October ₪350, as calculated. It showed ₪500 owed: the ₪400 order (₪300 left, 1 Nov) above the ₪200 one (6 Nov). The five tabs fit at 360 px. The reminder link went to `wa.me/972521234567`, with "נשאר לתשלום ₪300" and the delivery date. Opening a card and tapping back returned to `#/money`, the button reading "→ למסך הכסף".

Not observed:
- WhatsApp opening from the button (the pane has no WhatsApp);
- the month turning over while the screen is open;
- the real Android back gesture.

Known gaps:
- A payment recorded on an order that was later cancelled still counts, by design (D40). There is no "refunded" state; clearing the payment takes it out.
- The month figures do not show how many payments they add up.
- As with the diary, an order opened from the money screen, then edited and saved, goes back to the orders list, not to the money screen: `startedFrom` looks only at the screen just before.

Not verified on a device; boxes 1, 2 and 4 wait for the Pixel, against a hand-calculated set of five orders.
