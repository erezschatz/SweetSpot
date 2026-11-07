# The predecessor

What the baker used for a week before this project. Gathered from its public marketing site on 2026-10-31. The service is not named here on purpose; the repo is public. Read when the question is "how did they do it" or "is this ported".

## What it is

Hebrew mobile-first CRM for women selling desserts from home. A hosted web app with login and card billing, delivered as a PWA via add-to-home-screen. Small operator, support over WhatsApp.

## Pricing and what she used

Two tiers, roughly ₪40 and ₪100 a month plus VAT, with a one-week trial. She was on the trial and entered her product catalogue with costs and margins, but no orders or customers. What she said she missed: direct access to her phone contacts.

## Feature inventory and port status

| Predecessor feature | Tier | Ported? | Where |
|---|---|---|---|
| Products with sale price | Basic | Yes | step 06 |
| Customers with full order history and notes | Basic | Yes | step 05 |
| Orders with status pipeline (quote sent → approved → deposit → final) | Basic | Yes, simplified: new → confirmed → delivered / cancelled; paid is a badge | step 03 |
| Deposit + final payment fields; "how much people owe you" on home | Basic | Payment after delivery, deposit optional (D16); owes list yes | steps 03, 08 |
| — (not in the predecessor) | — | Pick customer from phone contacts (D18) | step 05 |
| Home dashboard: month income, target | Basic | Income yes; target no | step 08 |
| Calendar week view; one-click sync to phone calendar | Basic | List diary yes (D8); sync no (D5) | step 07 |
| Branded quote (logo, colour) sent as WhatsApp link; customer approves in-link; status flips | Basic | No (D4). Replaced by a WhatsApp *text* "order accepted" summary the customer confirms (D17) | step 04 |
| Per-baker public landing page | Basic | No (D4) | — |
| Export all data in one click; 30-day undelete | Basic | Export yes (JSON); undelete no — backup file is the undo | step 02 |
| Works on phone and desktop | Basic | Phone only verified (D7) | — |
| Ingredients catalogue with prices; cascading recalculation | Pro | Yes, on her request (D35): pack price and quantity, cost summed live | step 09 |
| Pre-seeded ingredient gallery with market prices; Excel import; recipe-from-photo | Pro | No (D3, D35) | — |
| Recipe scaler | Pro | Yes, shown, not stored (D36) | step 09 |
| Min price (10% margin) and recommended price (40%) | Pro | Yes, same two marks, fixed (D36) | step 09 |
| Monthly profitability report; per-order margin | Pro | Month's income − materials on Money; margin on the order (D35, D36) | step 09 |
| Auto shopping list for next two weeks | Pro | Yes, derived, no ticks (D36) | step 09 |
| Customer review requests | Pro | No | — |
| Support in Hebrew via WhatsApp; they will enter your ingredients for you | — | The programmer is the support | — |

## Things worth copying from how they did it

- Their install page detects the device and shows the add-to-home-screen steps for it, with four plain promises: an icon, full screen, stays signed in, takes no space and updates itself. Step 09's hand-off page should say the same four things.
- The pains their marketing lists are the right ones to keep in mind: pricing a cake with a calculator, juggling a spreadsheet, WhatsApp and bit, discovering a missed order in the morning, waiting days for a WhatsApp "yes", fear of missing a payment.
- The order status pipeline is surfaced on the order card itself, not hidden in a detail view.
- Customer card = "what she ordered, when, how much she paid, what to remember about her". That is the whole customer screen.

## Things deliberately not copied

- Their one-way "customer sees a pretty page" flow. Our customer sees a WhatsApp message, which is what she already sends by hand.
- Their maintained ingredient prices, import and recipe-from-photo. She asked for the core of their costing (parts, priced materials, the sum against the price) and step 09 builds it with the arithmetic on top (D35, D36); the gallery and the server-side pieces stay theirs.
