# 07 · Diary front screen

## Context

**Promise.** The baker opens the app and immediately sees what is due today, this week and next — what to bake, what to hand over, and what is still waiting on a "yes" — so nothing falls between the chairs.

**Acceptance**

- [ ] Front screen (`#/`): sections *today*, *this week*, *next week*, *later*, each a day-grouped list of orders by delivery date with status and paid/owes badge; confirmed orders first, new (unconfirmed) orders shown but visually quieter.
- [ ] A line for overdue items (delivery date passed, not delivered/cancelled) at the top, if any; and a line for *delivered, not paid* — since payment is after delivery (D16), this is her real "don't forget" list.
- [ ] Bottom navigation: diary · orders · customers · products · money · settings. Primary "new order" action reachable with the thumb.
- [ ] Backup nag at the top when `lastBackupAt` is older than 14 days or missing, linking to settings.
- [ ] `src/lib/dates.ts` (week boundaries, Sunday–Saturday weeks, Hebrew day names via `Intl`) tested.
- [ ] Verified on the Pixel across a week boundary (change the phone's date).
