# Unities 0.5.5: the record compiled from the task files

## Context

Asked by Erez on 2026-11-19, by running the `unities-project` skill on this repo. The repo's `docs/UNITIES.md` was the copy planted at step 00 (2026-10-31), without a date line. The skill's master is dated 2026-11-19, version 0.5.5, so the skill replaced the copy and carried out what the newer runbook adds. This file is the adoption task the runbook asks for (its 5.3). The repo had none, because step 00 was its kickoff.

Erez's answers, 2026-11-19: only Claude Code works here; the plan's estimates and "Answered 2026-11-02" stay as a fixed introduction; "Possible later" becomes `Not in scope: Later — …` lines in a decision that supersedes D44; the rest as proposed.

**Promise** — a fresh session finds every decision and the plan compiled from the task files, so a decision is written once, where the work is, and nobody keeps a list by hand.

**Acceptance**

- [x] Claude replaces `docs/UNITIES.md` with the master copy of 2026-11-19 · 0.5.5, byte for byte.
- [x] `node --test .claude/hooks/check-unit.test.mjs` passes, as run by Claude, with this repo's `RULES` in the strict staging.
- [x] `node scripts/compile-record.mjs --check` exits 0, as run by Claude; `docs/DECISIONS.md` keeps D1–D46 unchanged above the marker, and the new decisions follow from D47.
- [x] Claude runs Phase 6 steps 1, 2, 3, 5 and 6 of the runbook and records their output here; step 4 is the real commit of this scene through `.githooks/pre-commit`.

## Decisions

### 2026-11-19 · Only Claude Code works here; no Codex bindings

**Decision** — The instructions stay in `CLAUDE.md`. No `AGENTS.md`, no `.codex/hooks.json`, no `.codex/agents/unities-reader.toml` (runbook 4.10 not installed). `AGENTS.md` is in the doc rule only so that the day it appears it counts as a doc.
**Rejected** — Moving the instructions to `AGENTS.md` with `CLAUDE.md` as the one line `@AGENTS.md`, and installing the Codex files.
**Why** — Erez answered on 2026-11-19 that nobody works here with another agent. One developer, one agent; the Codex files would be unverified and unused. Recorded because no earlier version of the runbook asked (it is new in 0.5.0).

### 2026-11-19 · Ideas for later are not-in-scope lines in a decision, not a hand-kept list in the plan

**Decision** — The ideas D44 put under "Possible later" in `docs/PLAN.md` are carried here as `Not in scope: Later — …` lines, as written there. A new idea enters as a small task file of its own: its `## Context` is the idea as it arrived, its decision carries such a line, and its `## What was done` says only that the idea was written down. The scene of recording an idea is complete when it is committed, so the compiled plan lists that file as a done step, never as open work. One becomes work only by a new decision that places it, and the decisions named beside it are the ones that decision would reopen or narrow. Ideas the programmer noted on 2026-11-10; none has a step, an estimate or a task file.
**Rejected** — (a) Keeping "Possible later" in the plan's hand-written introduction: from today the gate refuses any edit to it, so no idea could be added. (b) A task file per idea that stays open until the idea is built: D44 rejected that, because an open task file is a step the plan says is to be done.
**Why** — The plan is now compiled (runbook 4.5), and its only inputs besides the task files are `Milestone:` and `Not in scope:` lines in decisions. "Not in scope" is true of these ideas: they are not in phase 1, and the prefix `Later —` keeps them apart from what was cut on purpose.
Supersedes: D44
Not in scope: Later — **Export the data to a file**: a PDF or sheet for the accountant (income, orders, materials by month), and a flat export (plain text or CSV) to hand to an LLM. The backup JSON already holds everything; this is a readable view of it. Touches "printing/PDF" under *Not in phase 1*.
Not in scope: Later — **A photo on each recipe**, beside its parts. Photos on orders are cut below; a recipe photo is a separate idea. Backups grow with every photo, as the logo already shows (D23).
Not in scope: Later — **Backup stored in a cloud drive** (Drive, for instance), instead of or beside the share sheet. Reopens D6, which rejects any account or remote store.
Not in scope: Later — **Recipes as recipes, and extracting them**: in the programmer's words, "recipes and extract recipes". Read as: the method (steps, times, notes) kept with a product's ingredients, and filling a recipe from text or a photo instead of line by line. To be confirmed when it is picked up. Extracting from a photo is D35 (b) and D36 (c), which say it needs a model behind a server.
Not in scope: Later — **Email as a contact option** (added 2026-11-10): an email address on a customer, and the order messages sent by email (a `mailto:` link, as WhatsApp is a `wa.me` link) for a customer who prefers it. Touches the customer row in the data model and the WhatsApp-only messages of D17 and D30.

### 2026-11-19 · The plan as it stood

**Decision** — The milestones and the "Not in phase 1" list of the hand-written `docs/PLAN.md` move here, as written, one line each; the step table gives way to the compiled steps. The estimates table, its total and "Answered 2026-11-02" stay above the marker as the plan's fixed introduction, as history.
**Rejected** — Dropping the estimates and the 2026-11-02 answers, which the compiler cannot produce; their content is history and is cited by the decisions D16–D21 and D35.
**Why** — Runbook 5.4: a repository adopted before 2026-11-11 converts its plan once. Erez chose on 2026-11-19 to keep the estimates and the answers as the fixed introduction.
Milestone: **After 01:** a blank SweetSpot opens full-screen from an icon on the programmer's Pixel, served from GitHub Pages. If this fails, the hosting decision is wrong.
Milestone: **After 04 (the proving milestone):** on the programmer's phone — create an order, tap "order accepted", WhatsApp opens with the Hebrew text addressed to the customer's number; force-stop Chrome, reboot, the order is still there. Nothing later is worth building if this fails.
Milestone: **After 09:** feature-complete for phase 1; the programmer uses it for a fake week of orders before 10.
Milestone: **After 11:** the baker has it on her phone and has made her first backup.
Not in scope: Costing beyond step 09 (D35, D36): a supplied list of ingredient prices, import, recipe-from-photo
Not in scope: labour and overhead on a recipe (D35)
Not in scope: customer approve-by-link and landing page (D4)
Not in scope: calendar sync and notifications (D5)
Not in scope: sync, cloud backup, login (D6)
Not in scope: iOS, dark theme, English, Samsung Internet (D7, D21)
Not in scope: week-grid diary (D8)
Not in scope: payment ledger (D9, D16)
Not in scope: structured flavour/layer fields and a size-to-guests suggestion (D19)
Not in scope: printing/PDF
Not in scope: invoices
Not in scope: photos on orders
Not in scope: search beyond name/phone
Not in scope: multiple businesses

### 2026-11-19 · The test rule of D33 survives the new check script

**Decision** — The new `check-unit.mjs` keeps `REQUIRED = ["doc", "task"]` plus `TESTED = /^src\/(lib|db)\//`: a test change is required only when logic in `src/lib` or `src/db` changes. Its tests keep the two D33 cases (logic without a test is refused; a screen-only change needs no test), and drop the runbook's three tombstone tests, since this repo has no retired files (`RULES.retired` matches nothing).
**Rejected** — The runbook's Appendix A as written, `REQUIRED = ["test", "doc", "task"]`, which would require a test for every screen change again.
**Why** — D33 is a listed decision and the runbook says to fill the rules from what the repo is, not from its examples (its §2, item 6). Screens are verified on the phone.

## What was done

2026-11-19. The runbook upgrade, in one commit (strict, D11; still one author, no pull-request policy, every commit through the gates).

- `docs/UNITIES.md` replaced by the master of 2026-11-19 · 0.5.5. The old copy had no date line.
- `.claude/hooks/check-unit.mjs` rewritten from Appendix A with this repo's rules:
  - the strict staging;
  - the rules from step 00, with `AGENTS.md` added to doc and `retired` matching nothing;
  - D33's `TESTED`;
  - release files `CHANGELOG.md`, `package.json`, `package-lock.json`.

  New in the script: the compiled record must be up to date and staged; the head of `docs/DECISIONS.md` and `docs/PLAN.md` may not change; acceptance boxes that name an outcome are refused; every new `## What was done` needs a `Reviewed by:` line; review items need Found / Done when / Not asked.
- `.claude/hooks/check-unit.test.mjs` rewritten from Appendix J: 40 tests, being the runbook's 41 minus its 3 tombstone tests, plus the 2 D33 tests carried over.
- `scripts/compile-changelog.mjs` from Appendix F: it leaves `Reviewed by:` lines out of the changelog. `scripts/compile-record.mjs` from Appendix K, unchanged; `npm run record` runs it.
- `docs/reviewer.md` written from Appendix G.
- `tasks/README.md` and `tasks/_template.md` from Appendix D. They keep this repo's naming (D12) and the verification line (D25), and add `## Decisions`, `Reviewed by:` and `## Review`.
- `CLAUDE.md`: the Unities paragraph replaced by Appendix E (strict), keeping D33 and Erez; the bullet about decisions now points at the task file.
- `docs/working-on-a-task.md`: decisions in the task file, `npm run record`, the reader's line, the new refusals at commit, a section on review rounds, the checklist.
- `docs/PLAN.md`: the hand-written step table, milestones, "Possible later" and "Not in phase 1" replaced by the compiled steps, milestones and not-in-scope lines. Above the marker, the estimates table, its total and "Answered 2026-11-02" stay as they were. Three things there are new: the first paragraph, rewritten to say the plan is compiled; a heading, `## Estimates as planned`, over the table; and the sentence "Phase 1 is steps 00–11."
- `docs/DECISIONS.md`: D1–D46 left exactly as they were above the marker. The four decisions above are compiled below it as D47–D50. No two old entries shared a number.
- Kept as they were: `.claude/settings.json`, whose `Stop` and `PreToolUse` bindings already equal Appendix B, and `.githooks/pre-commit`. The latter differs from Appendix C only by closing stdin (`</dev/null`), the fix step 00 found.
- Not installed: the CI gate (4.7), optional in strict; the Pages workflow builds and deploys, it does not gate. The Codex files (D47).
- Release boundary: the first commit, since there is no tag yet; step 11 makes `v1.0.0`.
- Effect on step 10: its next record needs a `Reviewed by:` line, and any decision it takes goes under `## Decisions` in `tasks/10-handoff.md`.
- This file sorts after `11-release.md`, so the compiled plan lists it last, as done.

Runbook Phase 6, run by Claude on Erez's Mac in this session:
- step 1: `check-unit.mjs --branch HEAD`, run before the commit, named only the missing `Reviewed by:` line of this record. In strict the uncommitted tree is the scene, so it is silent only once that line is written; it is run again on the clean tree after the commit.
- step 2: a staged `src/_unities_probe` was refused with exit 2 ("no doc change; no task change; compiled record not staged").
- step 3: `compile-changelog.mjs --dry-run` lists the task records since the first commit, because there is no tag; `compile-record.mjs --check` exits 0.
- step 5: `.claude/settings.json` parses, with `Stop` and `PreToolUse`.
- step 6: 40 of 40 tests pass.

Step 4 is this commit, made through the pre-commit hook. Not run by Erez; nothing here runs on the phone.

A cold reader found three things before the commit, and all three were fixed before it (`## Review · 2026-11-19` below):
- the plan's introduction carried its "Total" paragraph twice;
- D48 contradicted itself on task files for ideas;
- the guide named only one compiled file whose head is fixed.

Reviewed by: a read-only Explore subagent, given `docs/reviewer.md` and the uncommitted diff

## Review · 2026-11-19

### The plan's fixed introduction has its "Total" line twice, and its rewrite is not in the record

**Found** — `docs/PLAN.md` above the marker: the "Total: ~16 evenings" paragraph appeared twice. The record did not name the rewritten first paragraph, the `## Estimates as planned` heading or "Phase 1 is steps 00–11."

**Done when**

- [x] `docs/PLAN.md` above the marker → the "Total: ~16 evenings" paragraph appears exactly once
- [x] the estimates table, the "Answered 2026-11-02" section and the title above the marker → the same as at HEAD, apart from the edits the record names
- [x] the `docs/PLAN.md` bullet in the record → names the rewritten introduction, the new heading and the new sentence
- [x] `node scripts/compile-record.mjs --check` after the fix → exits 0
- [x] `docs/DECISIONS.md` above the marker → byte-identical to HEAD (D1–D46)

**Not asked** — any other wording change to the plan's introduction or to D1–D46; moving the estimates below the marker.

### D48 contradicts itself, and the compiler turns its idea files into open steps

**Found** — D48 said a new idea enters as a task file of its own, and rejected "a task file per idea" because a task file is a step; the compiler lists such a file as an open step.

**Done when**

- [x] D48's **Decision** and **Rejected** lines → no longer contradict each other: the rejected option is a task file that stays open until the idea is built
- [x] a new idea entered the way D48 and `docs/working-on-a-task.md` §1 describe → its file carries a `## What was done` saying the idea was written down, so `npm run record` lists it as done, not open; D48 says so
- [x] the five `Not in scope: Later — …` lines → still compiled under `## Not in scope` with `(D48)`
- [x] D49's milestones and not-in-scope lines → unchanged in the compiled plan

**Not asked** — a change to `scripts/compile-record.mjs`.

### The developer's guide names only one file whose edited head the gate refuses

**Found** — `docs/working-on-a-task.md` §4 named only `docs/DECISIONS.md`; the hook refuses an edited head of both compiled files.

**Done when**

- [x] the §4 refusal list → names an edited head of either `docs/DECISIONS.md` or `docs/PLAN.md`
- [x] the other §4 refusals → unchanged

**Not asked** — any change to the hook.
