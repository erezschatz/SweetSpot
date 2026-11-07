# Plan

Ordered steps. No status column: a step is open until its task file has a `## What was done` section, done when it has one, shipped when a compiled release includes it. Estimates are evenings (~2 focused hours, Claude Code on the oars, programmer verifying on the phone).

| Step | Task file | Evenings |
|---|---|---|
| 00 | [Skeleton and documentation](../tasks/00-skeleton.md) | 0.5 |
| 01 | [Toolchain green](../tasks/01-toolchain.md) | 1 |
| 02 | [Data layer and backup](../tasks/02-data-layer.md) | 1 |
| 03 | [Orders](../tasks/03-orders.md) | 2 |
| 04 | [WhatsApp buttons and persistence](../tasks/04-whatsapp.md) | 1 |
| 05 | [Customers](../tasks/05-customers.md) | 1 |
| 06 | [Products](../tasks/06-products.md) | 0.5 |
| 07 | [Diary front screen](../tasks/07-diary.md) | 2 |
| 08 | [Money](../tasks/08-money.md) | 1 |
| 09 | [Recipe costing](../tasks/09-costing.md) | 4 |
| 10 | [Polish and hand-off](../tasks/10-handoff.md) | 1.5 |
| 11 | [Release 1.0](../tasks/11-release.md) | 0.5 |

Total: ~16 evenings. The programmer's target is two calendar weeks, which means nearly every evening; the realistic slack is in 10. Step 09 was added on 2026-11-07 (D35, widened the same day by D36), when steps 00–06 had taken five days and left a week in hand.

## Milestones

- **After 01:** a blank SweetSpot opens full-screen from an icon on the programmer's Pixel, served from GitHub Pages. If this fails, the hosting decision is wrong.
- **After 04 (the proving milestone):** on the programmer's phone — create an order, tap "remind deposit", WhatsApp opens with the Hebrew text addressed to the customer's number; force-stop Chrome, reboot, the order is still there. Nothing later is worth building if this fails.
- **After 09:** feature-complete for phase 1; the programmer uses it for a fake week of orders before 10.
- **After 11:** the baker has it on her phone and has made her first backup.

## Answered 2026-11-02 (was "Before step 03")

Her phone: Samsung Galaxy, Chrome (D21). Orders are named by the customer (D19). Payment is after delivery, cash/bit/PayBox; deposits are the exception (D16). The date that matters is delivery; the first message is "order accepted", which the customer confirms (D17). Orders arrive by call or voice note; what she juggles is event date, guests, size vs. guests, design, flavours (D19). What she asked for by name: picking customers from her contacts (D18). Her notation: `דנה לוי- עוגת פרחים, 4 שכבות, שוקולד +שוקולד- פרווה`.

## Not in phase 1

Costing beyond step 09 (D35, D36): a supplied list of ingredient prices, import, recipe-from-photo · labour and overhead on a recipe (D35) · customer approve-by-link and landing page (D4) · calendar sync and notifications (D5) · sync, cloud backup, login (D6) · iOS, dark theme, English, Samsung Internet (D7, D21) · week-grid diary (D8) · payment ledger (D9, D16) · structured flavour/layer fields and a size-to-guests suggestion (D19) · printing/PDF · invoices · photos on orders · search beyond name/phone · multiple businesses.
