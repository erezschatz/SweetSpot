# 08 · Money

## Context

**Promise.** The baker sees how much came in this month and exactly who still owes her what — without opening a single order.

**Acceptance**

- [ ] Money screen: this month's income (payments dated this month), previous month for comparison, and a list of delivered orders with an outstanding balance (customer, amount, delivery date, tap → order, tap → WhatsApp payment reminder).
- [ ] Income counts a deposit on its `depositPaidAt` month and the payment on its `paidAt` month; cancelled orders' paid deposits still count as income.
- [ ] `src/lib/money.ts` extended with month totals; tested.
- [ ] Verified on the Pixel against a hand-calculated set of five orders.
