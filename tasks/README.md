# tasks/

How to work on a task — receiving it, finishing it, what the commit needs:
`docs/working-on-a-task.md`. This file is the format.

One file per task. Task files are the record; everything else (CHANGELOG.md, boards,
status) is compiled from them and never edited by hand.

This repo has no work-item tracker (D12). A task file is named `NN-<description>.md`,
where `NN` is its position in `docs/PLAN.md` and the description is short kebab-case.
A task that arrives outside the plan (the baker's feedback after 1.0) is named by its
description alone and gets a number when the plan places it; renaming is fine, because
the changelog compiler follows renames.

A task file has:

- a title (H1);
- `## Context`: the **Promise** (what the baker gets, in her words, never
  implementation) and **Acceptance** checkboxes — written when it arrived;
- `## What was done`: appended in the same commit as the change it describes, once,
  never edited afterwards. It ends with a verification line:
  `verified YYYY-MM-DD, <device>, <who>`. A task may accumulate several such sections
  over several commits; each is a separate entry in the compiled changelog.

Status is derived: no "what was done" → open; present → done; included in a compiled
release → shipped. There is no status field to keep in sync.

Outside input enters here and nowhere else. If it is not a task file, it did not arrive.
