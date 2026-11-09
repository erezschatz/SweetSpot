# 07 · Diary front screen

## Context

**Promise.** The baker opens the app and immediately sees what is due today, this week and next — what to bake, what to hand over, and what is still waiting on a "yes" — so nothing falls between the chairs.

**Acceptance**

- [x] Front screen (`#/`): sections *today*, *this week*, *next week*, *later*, each a day-grouped list of orders by delivery date with status and paid/owes badge; confirmed orders first, new (unconfirmed) orders shown but visually quieter.
- [x] A line for overdue items (delivery date passed, not delivered/cancelled) at the top, if any; and a line for *delivered, not paid* — since payment is after delivery (D16), this is her real "don't forget" list.
- [x] Bottom navigation: diary · orders · customers · products · money · settings. Primary "new order" action reachable with the thumb.
- [x] Backup nag at the top when `lastBackupAt` is older than 14 days or missing, linking to settings.
- [x] `src/lib/dates.ts` (week boundaries, Sunday–Saturday weeks, Hebrew day names via `Intl`) tested.
- [x] Verified on the Pixel across a week boundary (change the phone's date).

## What was done

2026-11-07, programmer's Mac. The three choices the programmer made before the work started, and two more made along the way, are D39.

**Pure logic, all tested (121 tests in all, 18 new):**
- `src/lib/dates.ts`:
  - `addDays`, through a local Date so a DST night neither skips nor repeats a day;
  - `weekStart`, the Sunday on or before a day;
  - `daysBetween`, rounded for the 23- and 25-hour days;
  - `weekdayName`, the long Hebrew day name via `Intl`.
- `src/lib/diary.ts`:
  - `buildDiary(orders, today)` returns the overdue orders, the delivered orders still owing, and four sections (today, rest of this week, next week, later), each grouped by day, confirmed before new, then by when the order was taken. Delivered and cancelled orders are left out of the sections.
  - `totalOwed`.
  - `backupDue` and `daysSinceBackup` count in local calendar days with a 7-day threshold (D39).
  - Tests stand on a Thursday and also cover a Saturday (this week is empty, and Sunday counts as next week), a Sunday, an order due today (not overdue), and a backup at 23:59 a week earlier.
- `src/lib/route.ts`: `#/` is the diary, and so is anything unknown. `#/orders` gets its own line, since it used to reach the list only by falling through to the end. The route tests expect the diary, and one more case pins `#/orders/abc/nonsense` to the order.

**Screens:**
- `src/screens/diary.tsx`, from the top:
  - the backup prompt, with a "גיבוי עכשיו" button that calls `backupNow()` in place;
  - the overdue line and the delivered-not-paid line (count and total). Each is a `<details>` that opens to its cards, with a marker that turns;
  - "today" with its weekday name, always shown, saying so when empty; the other sections only when something is due, each day headed by `formatDay`;
  - the "new order" button.
  - Today is re-read when the app comes back to the front and once a minute while it stays there, so an app left open overnight moves on.
- `src/ui/order-card.tsx`: the order card moved here from the orders list, so the diary can use it. It leaves out the date where the card already sits under a day heading.
- `src/ui/bottom-nav.tsx`: four tabs (diary, orders, customers, products), and the settings gear in the header. The gear is Material Design's "settings" icon (Apache 2.0), drawn inline. Forms hide the bar. The header pills are gone.
- `src/ui/router.ts`:
  - `cameFrom` is exported, and `startedFrom()` built on it: an order opened from the diary goes back to it, and its back button reads "ליומן";
  - a new order started from the diary returns there on save. The detail and the form both read `startedFrom()` once, when they open, because by the time she taps, history may have moved on.
- CSS:
  - the floating button and the page's bottom padding make room for the bar;
  - new orders in the diary have a lighter card and muted text.
- `src/i18n/he.ts`: `nav.diary`, the `diary` block and `orders.backToDiary`. `src/screens/settings.tsx`: its comment only.
- `docs/SPEC.md`: the diary, navigation, routes and backup prompt. D39: the choices.

**Observed by Claude** in the browser pane at 375×812 and 360×780 against the dev server, not on a device, with nine seeded orders on Saturday 2026-11-07:
- **Prompt and lines:** the backup prompt showed "עוד לא גיבית". The overdue line showed one order and opened to its card, dated. The unpaid line showed one order, owing ₪220 after a deposit.
- **Sections:**
  - "היום · יום שבת" had a confirmed order, then a quieter new one.
  - "השבוע" was hidden, being empty on a Saturday.
  - "שבוע הבא" held Monday the 9th (confirmed before new) and Thursday the 12th.
  - "בהמשך" held the 20th.
  - Delivered orders were in no section.
- **Back button:** an order opened from the diary showed "→ ליומן" and returned to the diary; opened from the orders list, it showed "→ לרשימת ההזמנות" and returned there.
- **Bar and gear:** a form had no bar. On settings the gear was highlighted and no tab was.
- **Backup dates:** the prompt read "לפני 9 ימים" at 9 days and "לפני 7 ימים" at 7, and was gone at 6.
- **360 px:** the orders list had no sideways scroll, and the floating button sat above the bar.

Not observed:
- the backup button itself, since the pane has no share sheet and would have downloaded a file;
- saving a new order started from the diary;
- the real Android back gesture;
- the date changing while the app is in the background.

A fresh-reader review led to these fixes before commit:
- today is re-read once a minute, not only when the app comes back to the front;
- the form reads where it was started from when it opens;
- two padding shorthands became logical properties.

Known gaps:
- An order opened from the diary lights the orders tab, while its back button says "ליומן".
- The not-found page of an order still links to the orders list.
- After editing an order and saving, the detail is opened from the form, so its back button leads to the orders list even if the order was first opened from the diary.

Not verified on a device; boxes 1–4 and 6 wait for the Pixel, across a week boundary (change the phone's date).

## What was done

2026-11-09, on the Pixel, by the programmer, from the current deploy. Erez reported that all of it landed, with no item failing and no further detail; the gaps the section above listed as not observed (a week boundary by changing the phone's date, saving a new order started from the diary, the Android back gesture, the backup button through the share sheet) were part of the run asked for. The three known back-navigation gaps stand; nothing was changed.

All acceptance boxes ticked. verified 2026-11-09, Pixel 9, Erez.
