# Working on a task

For the person doing the work. The agent's side is `CLAUDE.md`; the procedure that installed all this is `docs/UNITIES.md`. This repo runs the **strict** staging: the commit is the scene.

## 1. Receiving a task

- Tasks are `tasks/NN-name.md`, in the order of `docs/PLAN.md`. Take the lowest-numbered one without a `## What was done` section.
- `## Context` is the brief — the promise to the baker and the acceptance boxes. It is not edited. If the brief turns out wrong, the fix is a `docs/DECISIONS.md` entry and, if needed, a new task; not a quiet rewrite of the promise.
- Something new turns up (a bug, a request from the baker, a better idea)? It becomes a task file first, named by its description. If it is not a file, it did not arrive.

## 2. Doing the work

- Work on `main`; one developer, no branches needed. A branch is fine for an experiment you may throw away.
- **Turn on the git binding once:** `npm install` runs `prepare`, which points `core.hooksPath` at `.githooks/`. From then on `git commit` runs the check.
- A commit is a complete scene: the code change, its test (for anything in `src/lib`), its doc line (`docs/SPEC.md` if behaviour or architecture changed; `docs/SETUP.md` if the toolchain did), and a `## What was done` section appended to the task. The hook refuses anything less. If you cannot finish the scene in this sitting, revert; do not save it for tomorrow.
- The roles, in plain words:
  - **source** — anything under `src/`.
  - **test** — a `*.test.ts` file (beside the code it tests, in `src/lib`) or anything under `tests/`.
  - **doc** — anything under `docs/`, plus `README.md` and `CLAUDE.md`.
  - **task** — a file in `tasks/` other than `README.md` and `_template.md`.
  - **shared** — `CHANGELOG.md`. Never edited by hand; the compiler writes it.
- One source change needs at least one of each of test, doc and task in the same commit. A commit that touches no source (docs only, a task's Context) is free.

## 3. Finishing

- Run it where it runs: install from the Pages URL on the phone and walk the acceptance boxes. Tick them in the task file.
- Write `## What was done` last: what changed, what was decided on the way, what was left out, ending with `verified YYYY-MM-DD, <device>, <who>`. Once committed it is never edited; a later change gets a new section.
- Before `git commit`, have a reader who did not write it read the diff cold against the section: does the section describe this change? In Claude Code that is a read-only subagent asked exactly that question. Its verdict is advisory; its value is that it did not write what it is checking.

## 4. At commit

- `.githooks/pre-commit` runs `check-unit.mjs --staged` and refuses an incomplete scene with the list of missing roles. Run it yourself any time: `node .claude/hooks/check-unit.mjs --staged`.
- In Claude Code the same check runs before any `git commit` the agent attempts, and at the end of every turn against the work tree. Second refusal in a row, the turn ends and the half-scene is reported to you; reverting it is your call.
- There is no pull-request gate (no CI, one developer). If a commit was ever made with `--no-verify`, `node .claude/hooks/check-unit.mjs --pr <earlier commit>` finds it.

## 5. Release

- `npm run changelog -- 1.0.0` compiles every `## What was done` section since the last tag into `CHANGELOG.md`. Commit that with `--no-verify` (the one documented bypass — the compiled file is a shared file and the hook would refuse it), then `git tag v1.0.0`.

## Checklist

- [ ] Task file exists and its Context was not edited
- [ ] Code + test + doc line + `## What was done` in one commit
- [ ] Ran on the phone; acceptance boxes ticked; verification line written
- [ ] A cold reader checked the section against the diff
- [ ] Any rejected alternative is a dated entry in `docs/DECISIONS.md`
