# 04 · WhatsApp buttons and persistence — the proving milestone

## Context

**Promise.** Right after the phone call, the baker enters the order and one tap opens WhatsApp to the customer with the written summary — what, for when, for how many, for how much — so the customer confirms the same thing she wrote down. Later taps send a reminder before delivery, "it's ready", and a payment reminder. She only presses send. And nothing she has entered is ever lost when she closes the app or restarts the phone.

**Acceptance**

- [ ] Four buttons on the order detail — *order accepted*, *reminder*, *ready*, *payment* — each opening `https://wa.me/<E.164>?text=<filled template>` in WhatsApp (not in a browser tab).
- [x] `src/lib/phone.ts` normalises Israeli numbers (`050-1234567`, `0501234567`, `+972 50 123 4567`) to `972501234567`; tested.
- [x] `src/lib/template.ts` fills `{name} {items} {guests} {eventDate} {deliveryDate} {total} {paid} {owes} {business}` with Hebrew formatting (`{items}` is one line per order line: product + details); tested.
- [ ] Settings screen: the four templates are editable with Hebrew defaults written in the feminine, addressed to the customer; "reset to default" per template.
- [ ] Verified on the Pixel: create an order for the programmer's own number, tap *order accepted*, WhatsApp opens with the summary to the right number; force-stop Chrome, reboot the phone, open from the icon: the order is there.
- [ ] Milestone recorded in `## What was done` with the date. If this step fails, stop and re-decide D1 before continuing.

## What was done

2026-11-03, programmer's Mac.

**Pure logic, all tested (83 tests in all, 17 new):**
- `src/lib/phone.ts`:
  - `toWhatsAppNumber` turns `050-1234567`, `0501234567`, `+972 50 123 4567`, `00972…` and `972…` into `972501234567`. It drops a trunk 0 written after 972 and accepts landlines (8 digits after 972).
  - A foreign number written with `+` or `00` is kept as is.
  - Direction marks from pasted text are ignored.
  - Anything else, such as a short number, letters or a number with no 0 or country code, gives `null`.
  - `whatsAppLink` builds the wa.me URL with the text encoded.
- `src/lib/template.ts`:
  - `templateValues` turns an order into the nine placeholders: one `• ` line per item in her notation, with "12 × " when qty > 1; dates through `formatDay`; money through `formatShekels`; paid-so-far and outstanding from `src/lib/orders.ts`.
  - A placeholder is empty when there is nothing to say.
  - `fillTemplate` fills every placeholder, leaves out whole any line holding an empty one, and keeps unknown braces as typed.
- The tests also check that each default message in `he.ts` uses only known placeholders, and that her notebook order fills the "order accepted" message line by line.

**Screens:**
- **Order detail:** under the name, a "וואטסאפ ללקוח" section has four buttons in a 2×2 grid: הזמנה התקבלה, תזכורת לפני מסירה, ההזמנה מוכנה, תזכורת תשלום.
  - Each is a plain link to wa.me with the filled message (`src/ui/whatsapp-buttons.tsx`, D30).
  - With no phone, or a number that can't be normalised, a Hebrew note replaces the buttons. The number in the note is shown left-to-right.
  - The payment reminder is offered only while something is owed.
  - The heading belongs to the buttons' component, so it never stands alone while loading.
- **Settings:** a "הודעות וואטסאפ" section explains the braces and lists what each placeholder means. Below it are the four messages, each in a text box.
  - Text she types is saved as she types (`settingsRepo.setTemplate`, in a transaction like the other settings writes).
  - "חזרה לנוסח המקורי" appears once a message differs from the default, and removes her version. Typing the default back also removes it.
  - A message emptied to nothing sends the default (`templateText`).
- **Default texts:** in `src/i18n/he.ts`, written from the baker to the customer. They avoid gendered verbs where Hebrew allows it and otherwise use the generic masculine (D30 supersedes this task's "in the feminine", per D28).
- **Persistence:** no new code. Storage is the same Dexie database and `persist()` request as step 02, so the reboot test on the Pixel checks those.
- `docs/SPEC.md` has the WhatsApp line as built.

**Observed by Claude** in the browser pane at 375×812, not on a device:
- A business name was set, and the "ready" message edited. A new order was made for "דנה לוי", `050-1234567`, her notebook line, 30 guests and no event date.
- All four buttons pointed to `https://wa.me/972501234567` with `target="_blank"`.
- The "order accepted" text had the item line, delivery day, guests, total and the business name, without the event-date or paid lines.
- "Ready" used the edited text. After "reset" it went back to the default, and the reset link disappeared.

Not observed: whether Android opens the WhatsApp app rather than a tab, how the text looks in WhatsApp, and the reboot. One extra tap remains: since D29, saving a new order returns to the list, so "order accepted" is one tap into the order away. A fresh-reader review of this diff led to the fixes above: templates typed back to the default or emptied, the payment reminder with nothing owed, the lone heading, the left-to-right number, and direction marks. Not verified on a device; boxes 1, 4 and 5 wait for the Pixel, box 6 for the milestone. Box 4 is to be ticked against D30 (no feminine for the customer), not its own wording.
