# SweetSpot — how to work here

SweetSpot is a local-first PWA order book for one home baker, one Android phone, Hebrew only. It replaces the parts of a subscription service she tried that she actually used. No backend, no login, no sync.

## Read first, in this order

1. `docs/SPEC.md` — what it is, what is cut, architecture, stack table.
2. `docs/DECISIONS.md` — what was chosen and what was rejected. Do not re-open a listed decision without saying so.
3. `docs/PLAN.md` — the ordered steps. Status is derived from `tasks/`, never written in the plan.
4. `tasks/README.md` — the task-file form.
5. `docs/PREDECESSOR.md` only when a question is "how did the predecessor do it".
6. `docs/SETUP.md` only for toolchain problems.

A fresh session — human or Claude — must be able to pick up from this repo alone. If something needed to continue the work is not in the repo, fix that gap before doing anything else.

## The Unities

The work, its record and its location are the same thing at the same time. Every commit
that changes source also carries its test, its doc line and a `## What was done` section
appended to the task file in `tasks/`. This is enforced, not requested: a Stop hook
refuses to end a turn with a half-recorded change, and `git commit` refuses an incomplete
scene (`.claude/hooks/check-unit.mjs`). `CHANGELOG.md` is compiled from task records at
release (`npm run changelog -- <version>`) and is never edited by hand. If a change cannot
be completed with its record in this sitting, revert it; do not leave it for later.
Any choice with a rejected alternative gets a dated entry in `docs/DECISIONS.md`; a listed
decision is not reopened quietly but by a new entry. Before committing, have a reader that
has not seen the work check that the task record describes the diff. The agent does not
claim a build is green or a feature works where it runs; Erez does. The developer's side
of all this is `docs/working-on-a-task.md`.

- Steps strictly in order unless a decision says otherwise.
- A step is done when every acceptance box is ticked, `## What was done` is written, **and the programmer ran it on the phone**. Record the verification line in that section.
- `docs/SPEC.md` is edited in the same scene as any behaviour or architecture change.
- Any choice with a rejected alternative gets a dated `docs/DECISIONS.md` entry.
- `CHANGELOG.md` is compiled from task files at release; never edited by hand.

## Code rules

- Readable to the programmer: if a construct would be unreadable to a strong TypeScript/React developer in week one of Preact, write it the plain way. No clever hooks, no signals unless a decision adds them.
- Folder budget (fixed): `src/db` (schema, repositories, backup), `src/screens` (one file per screen), `src/ui` (shared components), `src/lib` (pure functions: money, dates, phone, templates), `src/i18n` (Hebrew strings). Nothing else at the top of `src/`.
- One file per unit; split at ~400 lines.
- Pure logic (money, dates, phone normalisation, template fill) lives in `src/lib` and has a Vitest test in the same scene. Screens are verified on the phone, not unit-tested.
- Comments explain *why*, not what.
- No new dependency without a row in the stack table in `docs/SPEC.md`.
- All user-facing strings go through `src/i18n/he.ts`. No Hebrew literals in components.
- RTL is the default: `<html dir="rtl" lang="he">`; use logical CSS properties (`margin-inline-start`, not `margin-left`).

## Division of labour

- **Claude** writes code, tests, docs and task records, in one scene per step. Claude never claims a build is green or a feature works on the device.
- **Erez** builds, deploys to GitHub Pages, installs on his Pixel, and says whether it works. He writes the "verified …" line.
- **The baker** receives the finished 1.0 at step 09 and is the only acceptance test that counts for Hebrew wording and tap-target size. Her feedback becomes new task files, not edits to shipped ones.
