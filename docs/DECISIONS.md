# Decisions

Dated, append-only. A decision is reversed only by a new entry naming the one it supersedes.

## D1 · 2026-10-31 · Local-first PWA, no backend
**Decision.** A static PWA with all data in IndexedDB on the baker's phone.
**Rejected.** (a) Kotlin + SQLite native app. (b) PWA with a backend on Atrium (the DigitalOcean server). (c) React Native.
**Why.** (a) costs a distribution channel — sideloaded APKs need the programmer for every update and Android nags escalate; Play Store needs a fee and a 20-tester closed test for a personal account — and it is not the programmer's stack. (b) was only needed for customer approve-by-link, which the baker rated nice-to-have; a backend adds an operations obligation to someone else's business. (c) adds the toolchain of (a) without its benefits. A PWA updates itself when opened, costs nothing to host, and is in the programmer's stack.

## D2 · 2026-10-31 · GitHub Pages, public repo
**Decision.** Host on GitHub Pages from a public repository, deployed by Actions on push to `main`.
**Rejected.** (a) Private repo on GitHub Pages. (b) Cloudflare Pages. (c) Atrium.
**Why.** (a) requires a paid GitHub plan. (b) works with a private repo for free but is a second platform to learn for no gain; nothing in the repo is secret, since her data never enters it. (c) makes her order book depend on the programmer's infrastructure.

## D3 · 2026-10-31 · No ingredients / costing in phase 1
**Decision.** Products have a sale price only.
**Rejected.** The predecessor's paid tier: ingredient catalogue, recipe costing, min/recommended price, profitability report, shopping list.
**Why.** The baker did not use it in her week on the predecessor and did not ask for it. It is the largest single piece of it and would double the project.

## D4 · 2026-10-31 · No customer approve-by-link, no landing page
**Decision.** Quotes are sent as WhatsApp text; acceptance is recorded by the baker changing the status.
**Rejected.** A hosted quote page the customer opens and approves.
**Why.** Needs a server (see D1). Rated nice-to-have.

## D5 · 2026-10-31 · No calendar sync, no notifications
**Decision.** The front screen *is* the diary; no ICS feed, no push.
**Rejected.** ICS export; Web Push.
**Why.** The baker said she does not want calendar sync. Web Push on Android PWAs is possible but unreliable enough that "open the app, see what's due" is the honest feature. Can be revisited after 1.0.

## D6 · 2026-10-31 · No sync, no cloud backup, no login
**Decision.** One phone holds the data. Backup is a JSON file the baker shares to wherever she likes (Drive, WhatsApp-to-self).
**Rejected.** Any account or remote store.
**Why.** D1. The risk — phone loss — is mitigated by the 14-day backup nag, not by infrastructure.

## D7 · 2026-10-31 · Android only, light theme only, Hebrew only
**Decision.** Verified on Android Chrome; nothing else is a target.
**Rejected.** iOS Safari testing; dark theme; English strings.
**Why.** One user, one phone. iOS PWAs have different install and storage rules and nobody will use it there. The code does not *prevent* other platforms; they are simply not verified.

## D8 · 2026-10-31 · Diary is a list grouped by day, not a week grid
**Decision.** Front screen: today / this week / next week as day-grouped lists.
**Rejected.** A seven-column week calendar.
**Why.** Week grids are the fiddliest UI on a phone and the baker has a handful of orders a week; a list answers "what is due" faster. Estimated at two evenings instead of three.

## D9 · 2026-10-31 · Payments are deposit + final, not a ledger
**Decision.** An order has one deposit amount, a deposit-paid date and a final-paid date.
**Rejected.** A payments table with arbitrary partial payments.
**Why.** Matches the predecessor's model, which the baker already understood, and matches how event cakes are paid. A ledger can be migrated to later with a Dexie version bump.

## D10 · 2026-10-31 · Stack: Vite + Preact + Dexie + vite-plugin-pwa
**Decision.** As in the spec's stack table.
**Rejected.** React (weight), Svelte/SolidJS (not the programmer's stack), raw IndexedDB (boilerplate), a router library, a CSS framework, a date library.
**Why.** Programmer explicitly does not care about dependencies but does care about time; Preact keeps the React mental model. Everything rejected is either unfamiliar or unnecessary for five screens.

## D11 · 2026-10-31 · Strict staging
**Decision.** The commit is the scene.
**Rejected.** Adapted (PR is the scene).
**Why.** One developer.

## D12 · 2026-10-31 · Plain task files, no tracker
**Decision.** `tasks/NN-name.md`, no issue ids.
**Rejected.** GitHub issues.
**Why.** One developer, eleven steps.

## D13 · 2026-10-31 · UNITIES.md runbook planted from the programmer's copy
**Decision.** `docs/UNITIES.md` is the programmer's own runbook, planted verbatim and carried out: check script and its tests, Claude Code `Stop` and `PreToolUse` bindings, `.githooks/pre-commit`, `tasks/README.md` and `_template.md`, the changelog compiler, `docs/working-on-a-task.md`. No CI gate (3.7): one developer, no CI.
**Rejected.** Re-implementing the gates from the skill's description; waiting for the skill to ship the runbook.
**Why.** The `unities-project` skill does not ship the runbook; the programmer supplied it the same evening. The skill should carry it beside `SKILL.md` so the next project does not need this step.

## D14 · 2026-10-31 · Money as integer agorot
**Decision.** All amounts stored and computed in agorot; formatted as shekels only in the UI.
**Rejected.** Floating-point shekels.
**Why.** Sums of deposits and balances must reconcile exactly on the money screen.

## D15 · 2026-10-31 · A source commit requires a test change
**Decision.** `REQUIRED = ["test", "doc", "task"]`: any commit touching `src/` must also touch a test file.
**Rejected.** Dropping `test` from `REQUIRED` because screens are verified on the phone, not unit-tested (`CLAUDE.md`, Code rules).
**Why.** It pushes each step to put its logic in `src/lib` with a test and keep screens thin, which is the design the spec wants anyway. The cost: a screen-only fix needs a (possibly small) test change in the same commit. If that turns ceremonial after a few steps, a new entry drops `test` from `REQUIRED`; it is one line. (Narrowed by D33: a test is required only for `src/lib` and `src/db`.)

## D16 · 2026-11-02 · Payment is after delivery; deposit is the exception
**Decision.** An order is paid or unpaid: `paidAt`, `paidMethod` (cash / bit / PayBox / transfer / other), `paidAmount`. A deposit is an optional second record on the same order (`deposit`, `depositPaidAt`, `depositMethod`), hidden behind "add deposit". Outstanding = delivered and not fully paid. Supersedes the deposit-first framing in D9.
**Rejected.** Deposit + final as two mandatory fields (D9's model); a payments ledger.
**Why.** The baker says customers pay cash, bit or PayBox after delivery. A form that leads with "deposit" is the predecessor's workflow, not hers. Deposits still happen, so the field exists, but it is not in the way.

## D17 · 2026-11-02 · "Order accepted" replaces "quote"
**Decision.** The first WhatsApp message is an order confirmation: the baker enters the order after the call, sends a summary ("הזמנה התקבלה: …") and the customer replies OK; the baker then taps "confirmed". Templates: *order accepted*, *reminder before delivery*, *ready for delivery/pickup*, *payment reminder*. Status pipeline: `new → confirmed → delivered → cancelled`, with paid as a derived badge, not a status.
**Rejected.** A quote step; a separate approve-by-link (D4 still stands).
**Why.** Her orders arrive by phone call or voice note with a lot of back-and-forth; there is no "quote" moment. What she wants is a written record the customer agrees to. The confirmation message *is* the quote.

## D18 · 2026-11-02 · Pick customers from the phone's contacts
**Decision.** "New customer" offers a *from contacts* button using the Contact Picker API (`navigator.contacts.select(['name','tel'])`), feature-detected, with typing as the fallback.
**Rejected.** Leaving contacts out; a permanent contacts sync.
**Why.** The one thing she named as missing in the predecessor. The API is one call, works in Chrome on Android (her browser) and returns only what she picks, so there is no permission to manage and nothing to sync. On a browser without it the button is simply absent.

## D19 · 2026-11-02 · Order details in her words, not in fields
**Decision.** An order line is: product (from the catalogue or free text), qty, unit price, and one free-text `details` line in her own format ("4 שכבות, שוקולד + שוקולד, פרווה"). Order-level: `guests` (number), `eventDate`, `deliveryDate`, `fulfilment`, `designNotes`. The order title defaults to the customer's name.
**Rejected.** Structured layers / flavour / filling / kosher-type fields; a size-to-guests calculator.
**Why.** Her own notation is `דנה לוי- עוגת פרחים, 4 שכבות, שוקולד +שוקולד- פרווה` — a name, a product and one line of details. Matching that is faster to enter and to read than a form with six dropdowns. What she juggles on the call (event date, number of guests, size vs. guests, design, flavours) is captured as a number, two dates and two text lines. A size-to-guests suggestion is a 1.1 candidate once there is a catalogue to hang it on.

## D20 · 2026-11-02 · Costing stays out; her catalogue is hers, not the repo's
**Decision.** D3 stands: no ingredients, no cost, no margin. The product catalogue is what she pointed at when asked how she names things, so step 06 is not an afterthought — but it ships empty. She enters her cakes and prices at hand-off (step 09), from her own notes.
**Rejected.** Reopening D3 because she entered costs in the predecessor; seeding the catalogue from her data inside the repo.
**Why.** She filled in the predecessor's costing because its product screen asked for it, and the result was cost/margin labels she did not mention wanting. If she asks for margins after 1.0, it is a new decision with a real request behind it. The repo is public (D2); her product names and prices are her business and stay on her phone and in her backups only.

## D21 · 2026-11-02 · Target device: Samsung Galaxy, Chrome
**Decision.** Verification device for hand-off is her Galaxy running Chrome. Samsung Internet is not a target.
**Rejected.** Testing both browsers.
**Why.** She said Chrome. One less install guide.

## D22 · 2026-11-02 · Public repo names no third party and ships no business data
**Decision.** The predecessor service is referred to only as "the predecessor" (`docs/PREDECESSOR.md`); no product names, URLs or prices identify it. The baker's catalogue, customers and any real name stay out of the repo; examples use invented names. The repository was deleted and recreated on 2026-11-02 and its two steps committed again from the scrubbed tree, so no commit in this history has ever carried either.
**Rejected.** Keeping the name in the docs for precision; keeping her catalogue as a seed.
**Why.** The repo went public for Pages (D2). Nothing is gained by naming a small business's competitor in public, and her prices are hers.

## D23 · 2026-11-02 · Her logo is data she uploads, not an asset in the repo
**Decision.** Settings has "business logo": she picks an image from her phone, it is resized to ≤512 px and stored as a blob in the `settings` row, shown in the app header and carried by backups. The home-screen icon stays SweetSpot's own generic icon.
**Rejected.** Committing her logo as the PWA icon and header image.
**Why.** The logo carries her name and brand; D22 keeps real names out of the public repo. The manifest icon cannot be user-supplied, but it is a thumbnail she taps, not something she looks at; the header is where the brand lives. Branding as data also means the app is not hers alone — a second baker gets her own.

## D24 · 2026-11-02 · Base path is `/SweetSpot/`, the repo name's exact case; stack on current majors
**Decision.** `base`, the manifest's `start_url` and `scope` are `/SweetSpot/`, written once in `vite.config.ts` (`index.html` uses `%BASE_URL%`). In the same change the toolchain moves to current majors: Vite 8, Vitest 5.1, Node 26 in Actions, and the Actions themselves to the majors that run on Node 24 (checkout/setup-node v7, upload-pages-artifact v5, deploy-pages v5).
**Rejected.** (a) Renaming the repo to `sweetspot` to keep the lowercase URL in the docs. (b) Staying on Vite 6 and the v4 actions until something breaks.
**Why.** The first deploy served an empty page that Chrome refused to install: Pages serves `/SweetSpot/` and 404s `/sweetspot/`, so every asset and the manifest were missing. (a) is equally valid but needs a rename on GitHub and a new remote; fixing the config is one line and keeps the repo as the programmer created it. If the baker's install URL should be lowercase, rename later and change this one constant. (b): Vite 6 was a stale default from the scaffolding container, not a choice; every plugin here accepts Vite 8, and Actions already warns that the Node 20 action runtime is deprecated. Upgrading at step 01, with nothing built on top, is the cheapest it will ever be.

## D25 · 2026-11-02 · Claude writes the verification line on the programmer's word
**Decision.** The programmer runs the check and says what happened; Claude writes the `verified YYYY-MM-DD, <device>, <who>` line in the task record, naming the programmer as the one who verified, and ticks the boxes his report covers. Supersedes the "He writes the 'verified …' line" clause in `CLAUDE.md`.
**Rejected.** The programmer editing the task file himself.
**Why.** Writing records is Claude's side of the division of labour; the programmer's side is running it and saying whether it works. Who ran it is unchanged — Claude still never verifies a device step on its own and never names itself for one.

## D26 · 2026-11-02 · Build-time audit findings in workbox-build are tolerated
**Decision.** The `glob@11` deprecation and the `npm audit` findings (deepmerge, glob, minimatch; low/moderate) are all inside `workbox-build`, which vite-plugin-pwa runs at build time to generate the service worker. They are left until vite-plugin-pwa/workbox ships newer versions. `fsevents`' install script is denied (`allowScripts`): the package already carries its macOS binary.
**Rejected.** (a) `npm audit fix --force`, which proposes breaking changes to the PWA plugin chain. (b) `overrides` forcing newer glob/minimatch into workbox-build, an untested combination owned by nobody here.
**Why.** None of that code ships to the phone; it reads files from `dist/` on the programmer's machine and in Actions. The exposure is a malicious glob pattern or object fed to a build tool we control, which does not occur. Forcing versions under a dependency trades a theoretical advisory for a real chance of a broken service worker.

## D27 · 2026-11-02 · Backup shares as .json, else as .txt, else downloads
**Decision.** "Backup now" offers the share sheet a `sweetspot-YYYY-MM-DD.json` file (`application/json`). If `navigator.canShare` refuses it, the same content is offered as `sweetspot-YYYY-MM-DD.txt` (`text/plain`); if that is refused too, the `.json` is downloaded. Restore accepts either extension. Closing the share sheet is "cancelled", and `lastBackupAt` is not updated.
**Rejected.** (a) `.json` only, falling straight to a download: Chrome on Android shares only a fixed list of file types, and as far as Claude knows JSON is not on it; a download lands in a folder she never opens instead of in Drive. (b) `.txt` always: loses the `.json` name where Chrome does accept it.
**Why.** The promise of step 02 is "hand a copy to anywhere she likes with one tap". The share sheet is that tap; a download is not. Which branch the Pixel takes is a device fact, recorded at verification.

## D28 · 2026-11-02 · Order screens: every status has a way back; title is the customer's name; the catalogue only suggests
**Decision.**
- Status buttons offer:
  - new → confirmed / delivered / cancelled;
  - confirmed → delivered / cancelled;
  - delivered → confirmed;
  - cancelled → new.
  Only cancelling asks for confirmation.
- An order's `title` is set to the customer's name on every save; the form has no title field.
- The line's product is a free-text field with the active catalogue as suggestions (`<datalist>`). Picking a catalogue name links `productId` and fills the price if she has not typed one.
- In the UI the customer is "לקוח" (generic masculine); only the baker is addressed in the feminine.
**Rejected.**
- (a) A strict forward-only pipeline.
- (b) An editable title field.
- (c) A separate product picker with a "free text" escape.
- (d) "לקוחה" for the customer.
**Why.**
- (a) On a phone a mis-tap is likelier than a real reversal, and a delivered order that cannot be un-delivered would show as owing forever.
- (b) Her notebook keys every order by the customer's name; a title field is one more thing to fill in for nothing. If she wants a different label, it becomes a task.
- (c) The catalogue ships empty (D20) and many lines are one-offs; one field that does both is faster one-handed.
- (d) Her customers are not all women; Hebrew UI convention for an unknown person is the generic masculine.

## D29 · 2026-11-03 · Order screens after the first Pixel run: any status from any status; save returns to the list; past orders suggest
Erez's first run of step 03 on the Pixel. This reopens D28's status moves; D28's title, catalogue and wording rules stand.
**Decision.**
- The order detail shows all four statuses as one segmented control with the current one marked. Any of them can be tapped from any other; only cancelling asks for confirmation. Replaces D28's per-status list of moves.
- Saving a new order returns to the orders list. Saving an edit returns to the order. The detail has a "back to the list" button at the top.
- The product field suggests, after the active catalogue, every product name from past orders, with the unit price she charged most recently (none if it was ₪0). A suggested price is replaced when she picks another suggestion, never one she typed.
- Number fields (qty, price, guests, deposit, payment amount) select their whole content on focus.
- "Paid in advance in full" is a deposit equal to the total: the deposit editor has an "all of it" button that fills the current total. When the paid deposit alone covers the total, the detail calls it "paid in advance" and offers no payment button; whenever the order is paid in full it says "paid in full, nothing owed". The button fills the total once; it does not follow later edits to the lines.
**Rejected.**
- (a) Keeping D28's moves: from *delivered* she had to go through *confirmed* to reach *cancel*, and it read as "no undo".
- (b) An undo toast after each change: one more mechanism, and tapping the right status is already the undo.
- (c) Staying on the order after creating it: Erez found it unclear how to go on.
- (d) A separate "paid in advance" flag or a second payment slot before delivery: the deposit already is a payment with a date and a method; a new field would need a schema version and change `paidSoFar`.
- (e) Waiting for step 06's catalogue for any suggestions: the catalogue ships empty (D20), and her past orders are already the list of what she sells.
**Why.** Each item is something Erez hit on the phone. The changes stay inside step 03's screens and `src/lib`; no schema change.

## D30 · 2026-11-03 · WhatsApp messages: plain wa.me links; empty lines dropped; the customer is not addressed in the feminine
**Decision.**
- Each of the four buttons is an `<a href="https://wa.me/…?text=…" target="_blank">`.
- A template line whose placeholder has nothing to say is left out of the message.
- The default texts avoid gendered verbs where Hebrew allows it (רשמתי, הזמנת, נתראה). Where it does not, they use the generic masculine of D28.
- A template she never edited is not stored; the default from `he.ts` applies, so a better default in a later version reaches her. "Reset" removes her version, as does typing the default text back. A template emptied to nothing counts as no template.
- The payment reminder is offered only while something is owed; with nothing owed it would be a bare "thank you".
- `{paid}`, `{owes}` and `{total}` are empty at ₪0, and `{guests}`, `{eventDate}` and `{business}` are empty when not filled.
**Rejected.**
- (a) `window.open(url)` from a click handler, as SPEC said.
- (b) The `whatsapp://send` scheme.
- (c) Leaving empty placeholders in place ("אורחים: ").
- (d) Two template sets, by the customer's gender.
- (e) The feminine for the customer, as task 04's acceptance text says. That text was written before D28.
- (f) Storing the defaults into settings on first run.
**Why.**
- (a) A link does the same with no script, keeps working if a handler throws, and is what Android's intent handling expects.
- (b) The scheme fails silently in a browser without WhatsApp; wa.me has a fallback page.
- (c) She would have to fix every message by hand before sending, which defeats one tap.
- (d) She would have to record a gender for every customer, for a difference most of the messages no longer have.
- (e) D28 decided the customer is the generic masculine, and the step 04 text is superseded here rather than edited.
- (f) Storing them would freeze today's wording in her data.

## D31 · 2026-11-03 · Customers: a rename carries to her orders; one customer per number, warned not enforced
**Decision.**
- Saving a customer edit also sets the title of every order of hers to the new name, in the same transaction.
- A contact picked in the order form whose number (normalised by `toWhatsAppNumber`) is already on a customer selects that customer.
- On the customer form, a number already on file shows "a customer with this number already exists", linking to them, but does not block the save.
- From a contact with several numbers, the first Israeli mobile is taken, else the first number.
- Notes are edited in place on the customer card and saved as she types; name and phone go through the edit form.
- "Total paid" is what came in over all her orders, deposits and payments, cancelled orders included.
- Delete is refused while the customer has orders, checked inside the delete transaction.
**Rejected.**
- (a) Leaving old titles alone, or dropping `title` and reading the name live.
- (b) Refusing a duplicate number.
- (c) Asking which number to use when a contact has several.
- (d) "Total spent" as the sum of order totals.
- (e) Deleting a customer together with her orders.
**Why.**
- (a) Old titles would show a name she just corrected. Dropping the field is a schema change for no gain while D28 says title = name.
- (b) Two people can share a home phone, and a warning is enough to avoid an accidental second customer.
- (c) WhatsApp needs a mobile; asking is a dialog for a choice she almost always makes the same way.
- (d) Unpaid and cancelled orders are not money she received.
- (e) Orders are her income record (step 08); losing them by deleting a contact is too easy.

## D32 · 2026-11-05 · Tappable things look like buttons; the focused field clears the save bar
Erez's Pixel feedback across the screens.
**Decision.**
- **Look:**
  - Every button, link-button, header pill and segmented control has a fill, an edge and a 2 px shadow, and moves down 1 px when pressed. The floating "new" button keeps its own larger shadow.
  - Secondary buttons are tinted (`--button-tint`, `--button-edge`), so they never look like the white input fields.
  - The header's הזמנות / לקוחות / הגדרות are pill buttons sharing the row, with the current one filled.
  - Cards that open something have a "‹" chevron and a soft shadow.
  - The underlined text actions (remove an item, remove the deposit, reset a message) are small outlined buttons (`button.small`).
  - The order's name is no longer an underlined link; a "פרטי הלקוח" button next to the phone opens the customer.
- **Back to the list:** at the bottom of the order detail and the customer card, as a full-width button, instead of a bold link above the title.
- **Keyboard:** with the keyboard open, the focused field is scrolled clear of the sticky save bar. `scroll-padding-block-end` asks the browser to do it, and a `visualViewport` resize / `focusin` handler does it if the browser does not, by an amount computed in `src/lib/keyboard.ts`. The handler counts only the part of the bar over the visible area, scrolls instantly, and does nothing while she is pinch-zoomed.
**Rejected.**
- (a) Making the save bar non-sticky while a field is focused: Erez liked the buttons riding up with the keyboard.
- (b) `scrollIntoView({ block: 'center' })` on every focus: it jumps even when the field is already visible, and centring puts a tall text box's cursor off screen.
- (c) A bottom tab bar now: that is step 07's navigation, and the header pills fix "looks like text" without moving it.
- (d) Back at both the top and the bottom: two ways to do one thing on a short screen. (Its full-width form is replaced by D33's shared bottom row.)
**Why.** He saw the field he typed into vanish under the bar on every form, and read bold links as text. A home baker tapping one-handed needs every target to say "tap me". Hebrew wording and tap-target size still get their final word from the baker at step 09.

## D33 · 2026-11-05 · A test is required only for logic; every screen ends in one row of actions
**Decision.**
- **Commit gate:** `check-unit.mjs` requires a test change only when a commit touches `src/lib` or `src/db`. Every source change still needs its doc and task record. This narrows D15 as D15 itself foresaw; Erez chose it.
- **Bottom row:** the order detail and the customer card end in one row of actions, with "back to the list" last, at the far end. On an order it shares the row with the payment buttons; on a customer, with Delete. This replaces D32's full-width back button.
- **Label:** the order detail's edit button reads "עריכת הזמנה". It sits next to "פרטי הלקוח", where a bare "עריכה" is ambiguous; on the customer card it stays "עריכה".
**Rejected.**
- (a) Keeping D15 and adding a test that checks nothing, to satisfy the gate.
- (b) Dropping the test requirement altogether.
- (c) A full-width back button on its own row, as in D32.
**Why.**
- (a) A ceremonial test is noise that says the rule is wrong.
- (b) The rule still earns its keep where the logic lives: money, dates, phones, templates and the data layer.
- (c) Erez wants the screen's last actions together, so leaving is one more button in that row, not a separate band.
- With three buttons (edit and cancel a recorded payment, plus back), the row wraps at phone width and back drops to a second line. The order stays the same.
- Delete on the customer card gives up the separate band step 05 gave it and sits beside back. It still asks for confirmation, and it is refused outright while the customer has orders.
- A test file anywhere, the hook's own tests included, satisfies the rule; it is a reminder, not a proof.
- `src/db` has no tests yet, so the first change there will need a real one, likely with an in-memory IndexedDB, and a stack-table row for it.

## D34 · 2026-11-05 · Products: retire, never delete; a tap opens the form; a retired name is not suggested
**Decision.**
- A product is added, renamed, repriced or retired, and never deleted.
- Retiring is a "במכירה" checkbox on the edit form. A new product is always on sale.
- The products list shows what is on sale by Hebrew name, then the retired ones under "הוצאו ממכירה", dimmed.
- Tapping a product opens its edit form directly; a product has no detail screen.
- A product needs a price (₪0 allowed), unlike an order line.
- A name already in the catalogue is warned, not refused.
- A retired product's name is not suggested in the order form, not even through a past order that used it. This narrows D29.
- "מוצרים" is a fourth pill. The pills move to their own full-width row under the logo and name, since four beside a logo do not fit 360 px.
**Rejected.**
- (a) Deleting a product.
- (b) A product detail screen.
- (c) Refusing a duplicate name.
- (d) Letting past orders keep suggesting a retired name.
**Why.**
- (a) Order lines may point at it (`productId`), and step 08's history should keep the name.
- (b) A product is two fields; a detail screen is a tap that shows nothing new.
- (c) Two sizes of one cake may share a name on purpose.
- (d) "Hidden from the order form" is the acceptance. Retiring would otherwise come back whenever an old order used it.
- Saved orders carry their own `unitPrice`, so repricing cannot change them. This is by design since step 03, not new code.

## D35 · 2026-11-07 · Recipe costing comes in before hand-off, materials only
**Decision.** D3 and D20 are reopened on the baker's own request. Shown the work in progress this week, she named one feature of the predecessor she wants: a recipe split into parts, each part made of priced materials, the sum tallied as her expenses and counted into the final price. That is the request D20 was waiting for, and it is built as step 09, after Money and before hand-off.
- An ingredients catalogue ("חומרי גלם"): name, unit (grams, millilitres or pieces), the quantity she buys and what it costs her. The cost per unit is derived, never typed.
- A product's recipe is a list of named parts, in her words ("בצק", "קרם", "קישוט"), each a list of ingredient lines with a quantity, for one unit of the product.
- A product's cost is the sum, computed live from the current ingredient prices and shown beside its sale price with the margin (price − cost, and as a share of the price). A product without a recipe has no cost, not ₪0.
- An order line snapshots `unitCost` at save when its product has a cost, exactly as it snapshots `unitPrice` (D34). Repricing an ingredient changes every product cost at once and no saved order.
- Money shows the month's materials cost: the cost of the orders delivered in the month, beside the income, with the difference. Lines without a cost are left out, and the screen says the figure follows the recipes she entered.
- Ingredients are reached from the products screen, not from a fifth header pill. An ingredient that a recipe uses cannot be deleted.
- Hand-off and release move to steps 10 and 11. "Step 09" in D20, `docs/PREDECESSOR.md` and `tasks/11-release.md` was written when it meant hand-off; the task files are renamed, their Context is not rewritten.
**Rejected.**
- (a) After 1.0, as a 1.1 the PWA updates itself to, which is what D20 planned.
- (b) The rest of the predecessor's paid tier: pre-seeded ingredient prices, Excel import, recipe-from-photo, the recipe scaler, min and recommended price, the profitability report, the shopping list.
- (c) Labour and overhead lines on a recipe.
- (d) Storing a product's cost on the product.
- (e) A fifth pill, "חומרים".
- (f) Retire-never-delete for ingredients, as D34 rules for products.
- (g) Expenses by payment month, to match income.
**Why.**
- D3's premise was that she had not asked. She has, with a shape, so the premise is gone and the decision is remade rather than quietly ignored.
- (a) The programmer is a week ahead of the two-week target and the step is sized at three evenings, which fits inside that week. She enters her catalogue at hand-off anyway (D20); entering the recipes in the same sitting is less work for her than a second sitting a week later.
- (b) None of these was in her request. They are what made D3 call the tier "double the project", and the predecessor's paid tier stays the place for them.
- (c) She said source materials. Packaging is a material and fits as an ingredient priced per piece. Her time is her judgment, not arithmetic the app should pretend to do.
- (d) A live sum is the predecessor's "cascading recalculation" with no recompute pass to get wrong. The snapshot on the order line keeps history honest the way `unitPrice` already does.
- (e) Four pills already needed their own row at 360 px (D34). Ingredients are edited rarely; a tap from the products list is enough.
- (f) A product has order history pointing at it. An ingredient has only recipes, and a recipe that uses it is the reason to refuse, as a customer with orders is refused (D31).
- (g) The cake was made for its delivery date, so its materials belong to that month. Income is by payment month because that is when the money arrived. The difference is an estimate, and the screen says so.
