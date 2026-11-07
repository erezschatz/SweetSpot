# 00 · Skeleton and documentation

## Context

**Promise.** A repository that a fresh session — human or Claude — can open and understand without the conversation that produced it.

**Acceptance**

- [x] `CLAUDE.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, `docs/PLAN.md`, `docs/SETUP.md`, `docs/PREDECESSOR.md`, `tasks/README.md` and all `tasks/NN-*.md` exist with real content.
- [x] `docs/UNITIES.md` is planted and carried out: `.claude/hooks/check-unit.mjs` and its tests pass (`npm run test:unities`), `.claude/settings.json` has the `Stop` and `PreToolUse` bindings, `.githooks/pre-commit` is active after `npm install`, `scripts/compile-changelog.mjs --dry-run` runs, `docs/working-on-a-task.md` exists.
- [x] Runbook verification (its section 5, steps 1, 2, 5, 6) run on the programmer's machine and its output recorded in `## What was done`.
- [x] Repo is public on GitHub, Pages enabled (source: GitHub Actions).
- [x] A reader who has not seen this conversation can state from the docs alone: what is built, what is cut, the proving milestone, and the stack.

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

## What was done

2026-11-07, on the programmer's Mac, at `a4d05fd`, Node v26.13.0. Claude ran runbook section 5, steps 1–6, again so that the output could go into this record (box 3):

```
$ node .claude/hooks/check-unit.mjs --branch HEAD </dev/null
→ exit 0, nothing printed
$ touch src/_unities_probe && git add src/_unities_probe
$ node .claude/hooks/check-unit.mjs --staged
Incomplete scene: no doc change; no task change. Complete the record in this same change, or revert it. Do not leave it for later.
→ exit 2
$ git commit -m probe
Incomplete scene: no doc change; no task change. Complete the record in this same change, or revert it. Do not leave it for later.
→ exit 1 (refused by .githooks/pre-commit)
$ git restore --staged src/_unities_probe && rm src/_unities_probe
→ tree clean
$ node scripts/compile-changelog.mjs --dry-run
→ exit 0, drafts records for 00–06
$ node -e '…Object.keys(require("./.claude/settings.json").hooks)'
Stop, PreToolUse
$ node --test .claude/hooks/check-unit.test.mjs
ℹ tests 14 · pass 14 · fail 0
```

The probe names only doc and task as missing because D33 dropped the test requirement for a file outside `src/lib` and `src/db`. On the first try, `--branch HEAD` without `</dev/null` waited on stdin when run from an agent shell, the same cause as the pre-commit hang above. `docs/SETUP.md` now says so.

Boxes 3 and 5 are ticked. Box 5: a read-only subagent was given only the docs, not this conversation or `src/`. From them it stated what is built, what is cut, the proving milestone and the stack, citing SPEC, PLAN and D10. It also flagged stale lines, which this commit corrects:
- the proving milestone named a "remind deposit" button that does not exist; it is now "order accepted", the button step 04 was verified with;
- SPEC cited D11 for the public repo instead of D2;
- SPEC's cut list cited D3–D9 without D16 and D35, which narrowed them;
- SPEC called it a "five-screen app"; it now says "an app this size";
- SETUP still had the baker's Galaxy from step 09 and the repo as `sweetspot`; it now says step 10 and `SweetSpot`, noting that the case matters (D24).

Left as they are: SPEC's "Version 0.1" (true until step 11) and its data-model "version 1" (true until step 09); dated decision entries (D20's step number, D35's pointer to the deleted predecessor file), because dated entries are not rewritten (D37).

Also in this commit, by the programmer's instruction: step 11 loses the subscription box (D38), and its stale "10" and "00–09" are corrected.

verified 2026-11-07, programmer's Mac (gate scripts and docs only), Claude.
