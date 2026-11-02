# 00 · Skeleton and documentation

## Context

**Promise.** A repository that a fresh session — human or Claude — can open and understand without the conversation that produced it.

**Acceptance**

- [x] `CLAUDE.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, `docs/PLAN.md`, `docs/SETUP.md`, `docs/PREDECESSOR.md`, `tasks/README.md` and all `tasks/NN-*.md` exist with real content.
- [x] `docs/UNITIES.md` is planted and carried out: `.claude/hooks/check-unit.mjs` and its tests pass (`npm run test:unities`), `.claude/settings.json` has the `Stop` and `PreToolUse` bindings, `.githooks/pre-commit` is active after `npm install`, `scripts/compile-changelog.mjs --dry-run` runs, `docs/working-on-a-task.md` exists.
- [ ] Runbook verification (its section 5, steps 1, 2, 5, 6) run on the programmer's machine and its output recorded in `## What was done`.
- [x] Repo is public on GitHub, Pages enabled (source: GitHub Actions).
- [ ] A reader who has not seen this conversation can state from the docs alone: what is built, what is cut, the proving milestone, and the stack.

## What was done

2026-10-31 to 2026-11-02, in the cloud session, before the repo existed.

- Kickoff interview answered in conversation; `CLAUDE.md`, `docs/SPEC.md`, `docs/DECISIONS.md` (D1–D15), `docs/PLAN.md`, `docs/SETUP.md`, `docs/PREDECESSOR.md` (the predecessor, from its public site) and `tasks/00`–`10` written.
- `docs/UNITIES.md` planted from the programmer's own runbook and carried out for the strict staging: `.claude/hooks/check-unit.mjs` (rules: source `src/`, tests beside code as `*.test.ts` or under `tests/`, docs `docs/` + README + CLAUDE.md, tasks `tasks/`, shared `CHANGELOG.md`; `REQUIRED` = test, doc, task — D15), its tests, `.claude/settings.json` with `Stop` and `PreToolUse` bindings, `.githooks/pre-commit` turned on by `npm install` (`prepare`), `scripts/compile-changelog.mjs`, `tasks/README.md` and `_template.md`, `docs/working-on-a-task.md`. No CI gate: no CI, one developer.
- Runbook verification steps 1, 2, 3, 5 and 6 run in the cloud container: `--branch HEAD` silent; a bare `src/` probe refused with "no test change; no doc change; no task change"; compiler dry-run reports no records; settings parse with both bindings; 12/12 hook tests pass on Node 22. Step 4 (a real refused commit) and the same run on the programmer's machine are still owed — two acceptance boxes left open for that.
- 2026-11-02: the baker's answers folded in — D16–D21, spec data model and scope, plan, tasks 03–09. Her catalogue is entered by her at hand-off, not shipped in the repo (D20).
- Found and fixed: the pre-commit hook hangs when `git commit` runs with a non-TTY open stdin (the script waits for hook JSON). `.githooks/pre-commit` now closes stdin; noted in `docs/SETUP.md` and owed back to the runbook's Appendix C.
- Repo: `erezschatz/SweetSpot` created by the programmer as **private**; D2 assumed public because GitHub Pages on a private repo needs a paid plan. Unresolved until step 01's first deploy; see `docs/SETUP.md`.

- 2026-11-02, later: repo made public; the predecessor's name, its pricing, her catalogue and a real customer name scrubbed from every file (D22), the predecessor doc renamed `docs/PREDECESSOR.md`. The repo was deleted and recreated by the programmer and both steps committed again from the clean tree (D22).

Not verified on a device: nothing here runs. verified 2026-11-02, cloud container (docs and gate scripts only), Claude.

## What was done

2026-11-02, on the programmer's Mac. Runbook section 5, steps 1, 2, 4, 5 and 6, run by the programmer: `--branch HEAD` silent; the `src/_unities_probe` file refused by `--staged`, and a real `git commit` of it refused by the pre-commit hook; settings parse with the `Stop` and `PreToolUse` bindings; the hook tests pass. He reported them as passing; the output itself was not pasted into this record. Run again by Claude on the same machine afterwards: `npm run test:unities` 12/12, compiler `--dry-run` exit 0. One leftover from the probe — `src/_unities_probe` still staged — tripped the Stop hook on the next turn and was removed.

Repo public, Pages source set to GitHub Actions by the programmer. Still open: box 3 wants the runbook output itself in this record, and box 5 (a reader who has not seen the conversation). verified 2026-11-02, programmer's Mac, Erez.
