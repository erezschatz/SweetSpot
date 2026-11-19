# tasks/

How to work on a task — receiving it, finishing it, what the commit needs:
`docs/working-on-a-task.md`. This file is the format.

One file per task. Task files are the record; everything else (docs/DECISIONS.md,
docs/PLAN.md, CHANGELOG.md, boards, status) is compiled from them and never edited by
hand. A task file belongs to one scene — one piece of work, on one branch, by one
developer with whatever agents, reviewers and hooks act for them — and everyone acting in
that scene writes in it. Two scenes never write the same file, which is why nothing here
needs a merge by hand.

This repo has no work-item tracker (D12). A task file is named `NN-<description>.md`,
where `NN` is its position among the steps and the description is short kebab-case.
A task that arrives outside the plan (the baker's feedback after 1.0) is named by its
description alone and gets a number when a decision places it; renaming is fine, because
the changelog compiler follows renames.

A task file has:

- a title (H1);
- `## Context`: what was asked, by whom, where it came from — written when it arrived.
  It carries the **promise** (what the baker gets, in her words, never
  implementation; it may be unverifiable) and the **acceptance** boxes. An acceptance box
  is a check: it names an actor who is the assignee of the task (or a script), a check
  that actor can perform, and a moment before the task closes. A box about the user,
  customers, adoption or production ("the user replaced the old app", "schema is running
  in production") is an outcome, not a check; it belongs in the promise or in
  `docs/PLAN.md` under *Milestones*, and the gate refuses it;
- `## What was done`: appended in the same unit (commit or pull request, by the repo's
  staging) as the change it describes, once, never edited afterwards once merged. A task
  may accumulate several such sections over several units; each is a separate entry in
  the compiled changelog. A step is done only when the programmer ran it on the phone,
  so the section carries the line `verified YYYY-MM-DD, <device>, <who>` once he has
  (D25); until then it says it is not verified on a device. Its last line is `Reviewed by: <who>`: the reader that had not
  seen the work and read the diff against this section before it was committed. The gate
  refuses a record without it;
- `## Decisions`, when the work chose one thing over another: one entry per choice,
  appended in the same unit, never edited or removed once merged.

      ### 2026-11-11 · <title: the choice, in a few words>

      **Decision** — <what was chosen>
      **Rejected** — <what was not, by name>
      **Why** — <the reason a newcomer would need>

  No number: `docs/DECISIONS.md` is compiled from these entries after the merge and the
  compiler numbers them (`D<n>`). Until then, refer to a decision by its task file and
  title. Optional lines at the end of an entry, each on its own line:
  `Supersedes: D7` (the only way a compiled decision is reversed);
  `Milestone: After 05: <outcome>` and `Not in scope: <thing>` (the only way a line gets
  into `docs/PLAN.md` — and it leaves when a later decision supersedes this one). A
  decision that comes from outside the work, a meeting or a request, gets a small task
  file of its own, written by whoever brought it in.

- `## Review · <date>`, when the work is reviewed: written by the reviewer (a person or
  a verifying agent) into this file, on the work's own branch. One `###` item per
  finding:

      ### <the finding, in a few words>

      **Found** — <where, and what happens now>

      **Done when**

      - [ ] <case> → <outcome>
      - [ ] <every other case of the same thing, including those that must not change> → <outcome>

      **Not asked** — <what the fix must not add: a schema change, an endpoint, a refactor>

  A *Done when* line is a state of the running program, never an instruction ("keep
  only…", "use them", "refresh while untouched" are instructions, and each has more than
  one reading). The gate refuses an item without the three parts or a line without `→`,
  and a pull request with an open box. The answer to a round is a further
  `## What was done` section; anything the fix needed beyond the item is first a
  `## Decisions` entry.

The plan's steps are the task files themselves: adding a step is adding a file here.

Status is derived: no "what was done" → open; present → done; included in a compiled
release → shipped. There is no status field to keep in sync.

Outside input enters here and nowhere else. If it is not a task file, it did not arrive.
