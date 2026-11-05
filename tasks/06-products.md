# 06 · Products

## Context

**Promise.** The baker enters each cake she sells once, with its price, and from then on adding it to an order is a tap. She can add, rename, reprice or retire a cake in seconds.

**Acceptance**

- [ ] Empty catalogue on first run; a one-line hint on the empty list says what to do (D20).
- [ ] Products list; add/edit name and price; deactivate (hidden from the order form, kept for history).
- [ ] The order form's product picker uses this list; changing a product's price does not change existing orders.
- [ ] Verified on the Pixel.

## What was done

2026-11-05, programmer's Mac.

**Pure logic, all tested (103 tests in all, 9 new):**
- `src/lib/products.ts`:
  - `validateProduct`: a name, and a price that is a number ≥ 0.
  - `productFromDraft`: shekels to agorot, trimmed; an edit keeps `createdAt`.
  - `splitCatalogue`: by Hebrew name, retired apart.
  - `findByName`: same name ignoring case and spaces, skipping the one being edited.
- `src/lib/order-draft.ts`: `lineSuggestions` no longer brings back a retired product through an old order. It was found doing so in the browser pane and is covered by a new test (D34).
- `src/lib/route.ts`: `#/products`, `#/products/new` and `#/products/:id`, with round-trip tests.
- `src/lib/money.ts`: `parseShekels("-0")` gives 0, not -0, so a price of "-0" is neither stored nor shown as "-₪0".

**Screens:**
- `src/screens/products.tsx`:
  - the empty list explains what to do (D20);
  - products on sale with their price, then "הוצאו ממכירה" with the retired ones dimmed;
  - "מוצר חדש" is a floating button.
- `src/screens/product-form.tsx`: name and price, a warning when the name already exists, and saving returns to the list. On edit only:
  - a note that changing the price does not change saved orders;
  - the "במכירה" checkbox with a line explaining retiring.
- Header: a fourth pill, "מוצרים". The pills now sit on their own full-width row under the logo and name (`src/app.tsx`), with less padding, because four pills beside a logo would not fit a 360 px screen.
- There is no delete for products, and `productsRepo` says why.
- The order form already took its suggestions from the active catalogue (step 03). Saved orders keep their own unit price.
- `docs/SPEC.md`: routes, and the retire and price rules. D34 records the choices.

**Observed by Claude** in the browser pane at 375×812, not on a device:
- The empty list showed its hint. Saving an empty form listed both Hebrew errors.
- Two products were added. Typing " עוגת פרחים " for a second one showed the duplicate warning.
- A new order suggested both and filled ₪320 for "עוגת פרחים".
- Repricing that product to ₪350 and retiring it left the saved order at ₪320. The product moved under "הוצאו ממכירה", and after the fix a new order suggested only "מגש קאפקייקס".
- The four header pills fit on one row.
- After a fresh-reader review warned about narrow screens: at 360×780, with a logo and the name "העוגות של נועה" in settings, the pills sat on one row inside the screen, with no sideways scroll.

Not verified on a device; boxes 1–4 wait for the Pixel.
