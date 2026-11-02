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
**Why.** It pushes each step to put its logic in `src/lib` with a test and keep screens thin, which is the design the spec wants anyway. The cost: a screen-only fix needs a (possibly small) test change in the same commit. If that turns ceremonial after a few steps, a new entry drops `test` from `REQUIRED`; it is one line.

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
