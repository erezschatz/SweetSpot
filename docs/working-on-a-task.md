# Working on a task

For the person doing the work. The agent's side is `CLAUDE.md`; the procedure that installed all this is `docs/UNITIES.md`. This repo runs the **strict** staging: the commit is the scene.

## 1. Receiving a task

- Tasks are `tasks/NN-name.md`, in the order `docs/PLAN.md` lists them (file-name order). Take the lowest-numbered one without a `## What was done` section.
- `## Context` is the brief — the promise to the baker and the acceptance boxes. It is not edited. If the brief turns out wrong, the fix is a `## Decisions` entry in the task file and, if needed, a new task; not a quiet rewrite of the promise.
- Something new turns up (a bug, a request from the baker, a better idea)? It becomes a task file first, named by its description. If it is not a file, it did not arrive. An idea nobody has committed to yet is a decision carrying a `Not in scope: Later — …` line, in a small task file of its own whose `## What was done` says the idea was written down (D48 in `docs/DECISIONS.md`).

## 2. Doing the work

- Work on `main`; one developer, no branches needed. A branch is fine for an experiment you may throw away.
- **Turn on the git binding once:** `npm install` runs `prepare`, which points `core.hooksPath` at `.githooks/`. From then on `git commit` runs the check.
- A commit is a complete scene: the code change, its test (for anything in `src/lib` or `src/db`, D33), its doc line (`docs/SPEC.md` if behaviour or architecture changed; `docs/SETUP.md` if the toolchain did), and a `## What was done` section appended to the task. The hook refuses anything less. If you cannot finish the scene in this sitting, revert; do not save it for tomorrow.
- The roles, in plain words:
  - **source** — anything under `src/`.
  - **test** — a `*.test.ts` file (beside the code it tests, in `src/lib`) or anything under `tests/`.
  - **doc** — anything under `docs/`, plus `README.md`, `CLAUDE.md` and `AGENTS.md`.
  - **task** — a file in `tasks/` other than `README.md` and `_template.md`.
  - **shared** — `CHANGELOG.md`. Never edited by hand; the compiler writes it.
  - **compiled record** — `docs/DECISIONS.md` and `docs/PLAN.md`. Never edited by hand: `npm run record` writes them from the task files. They do not count as a doc change.
- One source change needs a doc and a task change in the same commit, and a test change too when it touches `src/lib` or `src/db` (D33). A change only to screens, `src/ui` or `he.ts` is verified on the phone instead. A commit that touches no source (docs only, a task's Context) is free of the role rules, but not of the record rules below.

## 3. Finishing

Code, test, document and review are one unit.

- Run it where it runs: install from the Pages URL on the phone and walk the acceptance boxes. Tick them in the task file.
- Write `## What was done` last: what changed, what was left out, and `verified YYYY-MM-DD, <device>, <who>` once it ran on the phone. Once committed it is never edited; a later change gets a new section. It becomes the changelog entry.
- Anything chosen over something else goes under `## Decisions` in the same task file, as `### YYYY-MM-DD · title` with **Decision** / **Rejected** / **Why** and no number. `Supersedes: D<n>` reverses an earlier one; `Milestone: …` and `Not in scope: …` lines are how anything gets into the plan. You open `docs/DECISIONS.md` and `docs/PLAN.md` only to read.
- Run `npm run record` so the two compiled files match the task files, and stage them.
- Before `git commit`, give the staged diff and the task file to a reader who did not write it, with `docs/reviewer.md` as its brief. In Claude Code that is a read-only subagent. What it finds goes into the task file; its name goes on the section's last line, `Reviewed by: <who>`. The hook refuses a new section without that line.

## 4. At commit

- `.githooks/pre-commit` runs `check-unit.mjs --staged` and refuses an incomplete scene, naming what is missing:
  - a role (doc, task, a test for `src/lib`/`src/db`);
  - a `Reviewed by:` line;
  - a compiled record that is out of date or not staged;
  - an edited head of `docs/DECISIONS.md` or `docs/PLAN.md` (D1–D46, and the plan's introduction, are fixed);
  - an acceptance box that names an outcome rather than a check;
  - a malformed review item.

  Run it yourself any time: `node .claude/hooks/check-unit.mjs --staged`.
- In Claude Code the same check runs before any `git commit` the agent attempts, and at the end of every turn against the work tree. Second refusal in a row, the turn ends and the half-scene is reported to you; reverting it is your call.
- There is no pull-request gate (no CI gate, one developer). If a commit was ever made with `--no-verify`, `node .claude/hooks/check-unit.mjs --pr <earlier commit>` finds it.
- Nobody else sets a status: a task is done when it has a `## What was done` section, and `docs/PLAN.md` shows that after `npm run record`.

## 5. A review round

- A review is written into the task's own file as `## Review · <date>`, by whoever reviews: you, or the reader.
- Each item has **Found** (where, and what happens now), **Done when** (one box per case, `case → outcome`, every case named, including the ones that must not change) and **Not asked** (what the fix must not add). The hook refuses an item missing one of these, or a line without `→`.
- An item is done when every *Done when* line holds for the running program, not when its wording is satisfied. A test for it exercises the behaviour, not the text of a source file.
- Anything the fix needs beyond the item is a `## Decisions` entry, written before it is built. What *Not asked* names is not built without asking.
- After the last item, read the whole diff of the round once for what the fixes themselves added or broke. The answer to a round is a further `## What was done` section.

## 6. Release

- `npm run changelog -- 1.0.0` compiles every `## What was done` section since the last tag into `CHANGELOG.md` (without the `Reviewed by:` lines). Commit that with `--no-verify` (the one documented bypass — the compiled file is a shared file and the hook would refuse it), then `git tag v1.0.0`.

## Checklist

- [ ] Task file exists and its Context was not edited
- [ ] Code + test + doc line + `## What was done` in one commit
- [ ] Ran on the phone; acceptance boxes ticked; verification line written
- [ ] Any rejected alternative is a `## Decisions` entry in the task file
- [ ] `npm run record` run and its output staged
- [ ] A cold reader checked the diff against `docs/reviewer.md`; `Reviewed by:` written
