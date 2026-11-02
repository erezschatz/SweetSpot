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
