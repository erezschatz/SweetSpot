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
- **After 04 (the proving milestone):** on the programmer's phone — create an order, tap "order accepted", WhatsApp opens with the Hebrew text addressed to the customer's number; force-stop Chrome, reboot, the order is still there. Nothing later is worth building if this fails.
- **After 09:** feature-complete for phase 1; the programmer uses it for a fake week of orders before 10.
- **After 11:** the baker has it on her phone and has made her first backup.

## Answered 2026-11-02 (was "Before step 03")

Her phone: Samsung Galaxy, Chrome (D21). Orders are named by the customer (D19). Payment is after delivery, cash/bit/PayBox; deposits are the exception (D16). The date that matters is delivery; the first message is "order accepted", which the customer confirms (D17). Orders arrive by call or voice note; what she juggles is event date, guests, size vs. guests, design, flavours (D19). What she asked for by name: picking customers from her contacts (D18). Her notation: `דנה לוי- עוגת פרחים, 4 שכבות, שוקולד +שוקולד- פרווה`.

## Possible later

Ideas the programmer noted on 2026-11-10 (D44). Not planned and not tasks: none has a step, an estimate or a task file. One becomes work only by a new decision that places it, and the decisions named beside it are the ones that decision would reopen or narrow.

- **Export the data to a file**: a PDF or sheet for the accountant (income, orders, materials by month), and a flat export (plain text or CSV) to hand to an LLM. The backup JSON already holds everything; this is a readable view of it. Touches "printing/PDF" under *Not in phase 1*.
- **A photo on each recipe**, beside its parts. Photos on orders are cut below; a recipe photo is a separate idea. Backups grow with every photo, as the logo already shows (D23).
- **Backup stored in a cloud drive** (Drive, for instance), instead of or beside the share sheet. Reopens D6, which rejects any account or remote store.
- **Recipes as recipes, and extracting them**: in the programmer's words, "recipes and extract recipes". Read as: the method (steps, times, notes) kept with a product's ingredients, and filling a recipe from text or a photo instead of line by line. To be confirmed when it is picked up. Extracting from a photo is D35 (b) and D36 (c), which say it needs a model behind a server.

## Not in phase 1

Costing beyond step 09 (D35, D36): a supplied list of ingredient prices, import, recipe-from-photo · labour and overhead on a recipe (D35) · customer approve-by-link and landing page (D4) · calendar sync and notifications (D5) · sync, cloud backup, login (D6) · iOS, dark theme, English, Samsung Internet (D7, D21) · week-grid diary (D8) · payment ledger (D9, D16) · structured flavour/layer fields and a size-to-guests suggestion (D19) · printing/PDF · invoices · photos on orders · search beyond name/phone · multiple businesses.
