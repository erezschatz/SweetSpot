# 05 · Customers

## Context

**Promise.** A new customer comes straight from the baker's phone contacts — no retyping a number — and from then on, typing a name or a number shows everything about her: what she ordered, when, what she paid, and the things worth remembering.

**Acceptance**

- [ ] "New customer" offers *from contacts* when `navigator.contacts` is available (D18): picks name and number, fills the form, nothing else is read. Without the API the button is absent and the form is typed.
- [ ] Customers list with a search box filtering by name or phone as you type.
- [ ] Customer card: name, phone (tap to call, tap to WhatsApp), notes (editable), order history list linking to each order, total spent.
- [ ] Edit and delete (delete refused while the customer has orders).
- [ ] The order form's customer picker (step 03) uses the same *from contacts* path for a new customer.
- [ ] Verified on the Pixel, including the contacts picker.

## What was done

2026-11-03, programmer's Mac.

**Pure logic, all tested (89 tests in all, 6 new):**
- `src/lib/customers.ts`:
  - `fromContact` takes the first non-empty name and, of several numbers, the first Israeli mobile, else the first number.
  - `findByPhone` finds a customer by number written any way, skipping the one being edited.
  - `customerHistory` lists orders newest delivery first, and totals what was paid (deposits and payments, cancelled orders included).
- `src/lib/route.ts`: `#/customers`, `#/customers/new`, `#/customers/:id` and `#/customers/:id/edit`, with their round-trip tests.

**Screens and data:**
- `src/screens/customers.tsx`: the list, sorted by name, with a search box. The search uses step 03's `matchCustomers` (part of a name, or digits in any format). "New customer" is a floating button.
- `src/screens/customer-detail.tsx`, the customer card:
  - name (edit button), phone, and buttons to call (`tel:`) and to open WhatsApp with no text;
  - notes, edited in place and saved as she types (`customersRepo.updateNotes`, a partial update);
  - number of orders, total paid, and her orders as cards linking to each;
  - delete, set apart at the bottom. With orders on screen it is refused straight away with a Hebrew message, without the confirm. Otherwise it asks, deletes through `customersRepo.deleteIfNoOrders` (which checks again inside the transaction), and steps back to the list.
- `src/screens/customer-form.tsx`, new and edit: "מאנשי הקשר", name and phone, and a warning with a link when the number is already on another customer. Saving an edit uses `customersRepo.save`, which renames her orders in the same transaction (D31) and returns to the card. A new customer opens their new card.
- `src/ui/contacts.ts`:
  - `canPickContact` feature-detects the Contact Picker. Without it the button is not rendered.
  - `pickContact` asks only for `name` and `tel`, one contact.
- The order form's customer picker (`src/ui/customer-picker.tsx`) has the same "מאנשי הקשר" button, on the search view and the new-customer view. A contact whose number is already on file selects that customer.
- Elsewhere:
  - "לקוחות" is in the header between orders and settings (`src/app.tsx`).
  - The order detail's title now links to the customer card.
  - Link buttons (`a.button`) now have the main button style, with their text centred; until now every one was `secondary` or WhatsApp-green, and those keep their look.
  - The unused `customersRepo.delete` is gone; `deleteIfNoOrders` is the only way to delete.
- `docs/SPEC.md`: routes, the customer rename rule, and the contact rules. D31 records the choices.

**Observed by Claude** in the browser pane at 375×812. The Contact Picker was simulated, because Chrome on the Mac does not have it: a stand-in returning one contact with a landline and a `+972 50…` mobile.
- **New customer from contacts:** the empty list showed its hint. "מאנשי הקשר" filled the name and the mobile, and saving opened the card with `tel:+972501234567` and `wa.me/972501234567`. Typed notes were still there after leaving and coming back.
- **Same contact in an order:** a new order picked from the same contact selected the existing customer, and the database still held one customer.
- **From the order:** the order's name led to the card, showing 1 order and ₪0 paid.
- **Edit:** renaming to "דנה לוי-כהן" with a new number updated the card, the WhatsApp link and the order's title in the list.
- **Delete:** refused for her with the Hebrew message. A second customer with the same number showed the duplicate warning, saved, and deleted cleanly back to the list.
- **Search:** "0527" found her, and an unknown name showed "לא נמצא לקוח".

A fresh-reader review led to three small fixes before commit: delete refuses before the confirm, steps back rather than adding the list to history, and a contacts error clears when she moves on. Not observed: the real Contact Picker on Android (its sheet, the permission, which numbers come back), `tel:` opening the dialer, and the WhatsApp chat opening. Not verified on a device; boxes 1–6 wait for the Pixel.

## What was done

2026-11-05, programmer's Mac. Erez's feedback from the Pixel, across all screens (D32).

1. **The field he typed into vanished under the keyboard and the save bar.**
   - The page now has `scroll-padding-block-end: 96px`.
   - `src/ui/keyboard.ts` (started from `src/main.tsx`) runs on every resize of the visible area (`visualViewport`; the keyboard opening is the case that matters) and when focus moves. It scrolls the focused field clear of the part of the `.actions` bar that is over the visible area, by the amount `scrollToClear` in `src/lib/keyboard.ts` works out. The scroll is instant, so the two triggers cannot stack. Nothing moves when the field is already clear or while she is pinch-zoomed, and a tall text box keeps its top in view. The bar is above the content (`z-index: 1`).
2. **The tab bar looked like text.** הזמנות / לקוחות / הגדרות are now pill buttons sharing the row, the current one filled.
3. **"Back to the list" was in the wrong place.** It is now a full-width button at the bottom of the order detail, and likewise on the customer card, where it comes after Delete so that Delete is not the last thing under the thumb.
4. **Actionable things should say "click me".** In `src/ui/base.css`:
   - every button, link-button and header pill has a fill, an edge, a shadow and a pressed state (not when disabled);
   - customer suggestions in the order form keep normal weight and get a card's soft shadow instead;
   - secondary buttons and the segmented controls are tinted, not white;
   - the underlined text actions are small outlined buttons: `button.small`, renamed from `button.link` in the order form and settings;
   - cards that open something get a chevron and a shadow;
   - the order's name is plain again, and a "פרטי הלקוח" button opens the customer (`he.orderDetail.customerCard`);
   - the order title has room above it.

**Tests:** 94 pass (5 new, for `scrollToClear`: already clear, hidden under the bar, above the top, a tall text box, no bar). `docs/SPEC.md` has the keyboard line and the bottom back button.

**Observed by Claude** in the browser pane at 375×812, not on a device:
- the header pills, the cards with chevrons, and the order detail with "פרטי הלקוח" and the full-width back button at the bottom.
- To stand in for the keyboard, the viewport was shrunk to 375×420. The qty field was scrolled to sit under the save bar (bottom at 416, bar from 347). Focusing it moved it to 138–186, clear of the bar.

A fresh-reader review led to the pinch-zoom guard, the instant scroll, counting only the visible part of the bar, and the pill, suggestion and Delete-order fixes above. Not observed: the real Android keyboard, and whether Chrome's own scroll or the handler does the work there. Not verified on a device; step 05's boxes still wait for the Pixel.
