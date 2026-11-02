# 04 · WhatsApp buttons and persistence — the proving milestone

## Context

**Promise.** Right after the phone call, the baker enters the order and one tap opens WhatsApp to the customer with the written summary — what, for when, for how many, for how much — so the customer confirms the same thing she wrote down. Later taps send a reminder before delivery, "it's ready", and a payment reminder. She only presses send. And nothing she has entered is ever lost when she closes the app or restarts the phone.

**Acceptance**

- [ ] Four buttons on the order detail — *order accepted*, *reminder*, *ready*, *payment* — each opening `https://wa.me/<E.164>?text=<filled template>` in WhatsApp (not in a browser tab).
- [ ] `src/lib/phone.ts` normalises Israeli numbers (`050-1234567`, `0501234567`, `+972 50 123 4567`) to `972501234567`; tested.
- [ ] `src/lib/template.ts` fills `{name} {items} {guests} {eventDate} {deliveryDate} {total} {paid} {owes} {business}` with Hebrew formatting (`{items}` is one line per order line: product + details); tested.
- [ ] Settings screen: the four templates are editable with Hebrew defaults written in the feminine, addressed to the customer; "reset to default" per template.
- [ ] Verified on the Pixel: create an order for the programmer's own number, tap *order accepted*, WhatsApp opens with the summary to the right number; force-stop Chrome, reboot the phone, open from the icon: the order is there.
- [ ] Milestone recorded in `## What was done` with the date. If this step fails, stop and re-decide D1 before continuing.
