#!/usr/bin/env node
// Copyright (c) 2026 Erez Schatz, https://github.com/erezschatz/unities. SPDX-License-Identifier: MIT
// A scene is complete or it is nothing. SCENE says how long a scene is:
//   "commit" (strict)  : every commit; --staged and --branch refuse.
//   "pr"     (adapted) : the pull request; --pr refuses, --staged and --branch warn.
//
//   --pr <target>   : what the PR changed since it forked from its target (gate; always enforces)
//   --staged        : what `git commit` is about to record       (pre-commit, PreToolUse)
//   --branch [base] : the scene so far, committed or not         (Stop)
//
//   --codex, after the mode: the caller is Codex's hooks, not Claude Code's (4.10). The
//   checks are the same; only how an adapted Stop reaches the agent differs.
import { execSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ---- per-repo: written by the adoption procedure from what it found ----
const SCENE = process.env.UNITIES_SCENE ?? "commit";   // strict staging (D11)
const RULES = {
  source:  /^src\//,                                 // e.g. /^(src|lib)\//
  test:    /(^tests?\/|\.(test|spec)\.[cm]?[jt]sx?$)/,   // Vitest files sit beside src/lib code
  doc:     /^(docs\/|(^|\/)(README|CLAUDE|AGENTS)\.md$)/,   // docs also live beside code
  task:    /^tasks\/(?!README\.md$)[^/_][^/]*\.md$/, // excludes README.md and _template.md
  shared:  /^CHANGELOG\.md$/,                        // compiled; never edited or deleted by hand
  retired: /^$/,                                    // a new project: no tombstones
};
const REQUIRED = ["doc", "task"];                   // roles every source change must be accompanied by
const TESTED = /^src\/(lib|db)\//;                  // source whose change also needs a test (D33)
const BASE = "origin/main";                         // the branch pull requests target
const RELEASE_FILES = /^(CHANGELOG\.md|package\.json|package-lock\.json)$/;   // what a release commit may touch
const COMPILER = "scripts/compile-changelog.mjs";
// docs/DECISIONS.md and docs/PLAN.md are compiled from the task files (Appendix K). Nobody
// writes them by hand: a decision is written in the task file of the work that made it.
const RECORD_FILES = /^docs\/(DECISIONS|PLAN)\.md$/;
const RECORD_COMPILER = "scripts/compile-record.mjs";
const RECORD_MARKER = "<!-- Compiled from tasks/ by scripts/compile-record.mjs.";
const SELF = ".claude/hooks/check-unit.mjs";
// An acceptance box names the assignee's check, before the task closes. One whose subject
// is the user, customers, adoption or production, or whose verb is a continuing state, is
// an outcome: a promise or a plan milestone, never a gate. Fixed; not per-repo.
const ACCEPTANCE_FORBIDDEN = /^(the |an? |all |active |end[- ])*(user|users|customer|customers|production|prod)\b|\b(is|are|was|were) (running|live|in use|using|deployed)\b|\b(has|have) (replaced|adopted|switched|migrated)\b|\b(started?|starts) (to use|using)\b|\bin production\b|\b(by|from) (active |real |the )?(users?|customers?)\b|\bactive users\b|\buninstall(ed|s)? the old\b/i;
// A record is read cold before it is committed (Appendix G). The gate cannot judge the
// reading; it checks that one is named. Records the migration carried over are exempt.
const REVIEW = /^Reviewed by:\s*\S/m;
const REVIEW_SECTION = /^## Review\b/;   // a review round, written into the task file of the scene it reviews
const REVIEW_EXEMPT = /^(Done before adoption; no record\.|Migrated from )/m;
// -----------------------------------------------------------------------

const strict = SCENE === "commit";
const codex = process.argv.includes("--codex");
const argv = process.argv.slice(2).filter(a => a !== "--codex");
const mode = argv[0] ?? "--branch";
// Only the hook modes are handed JSON on stdin; --pr must not wait on a pipe its caller left open.
const input = mode === "--pr" || process.stdin.isTTY ? {} : JSON.parse((await readStdin()) || "{}");
const cwd = input.cwd ?? process.cwd();
const lines = s => s.split("\n").map(l => l.trim()).filter(Boolean);

// PreToolUse's `if` filter is best-effort; make sure this really is a commit.
if (input.hook_event_name === "PreToolUse" &&
    !/(^|[;&|]\s*)git\s+commit\b/.test(input.tool_input?.command ?? "")) process.exit(0);

let files, base, deleted;   // deleting a tombstone is not editing it
if (mode === "--pr") {
  const target = argv[1];
  if (!target) fail("usage: check-unit.mjs --pr <target>");
  // A name git does not know is not a target that has yet to adopt: refuse, do not skip.
  if (!gitOk(`cat-file commit ${target}`))
    fail(`${target} is not a commit this checkout knows; check the name, or fetch the branch (a single-branch or shallow clone may not have it).`);
  if (!adopted(target)) skip(`${target} has no ${SELF}; the record is not required until the target adopts it.`);
  // The PR's own change, measured from where it forked. The target's tip may have
  // moved on since, and its new commits are not this PR's.
  if (!gitOk(`merge-base ${target} HEAD`))
    fail(`no merge base between ${target} and HEAD; the checkout needs the history back to where the branch forked (a shallow clone may not have it).`);
  base = git(`merge-base ${target} HEAD`).trim();
  files = lines(git(`diff --name-only ${base} HEAD`));
  deleted = lines(git(`diff --name-only --diff-filter=D ${base} HEAD`));
} else if (mode === "--staged") {
  files = lines(git("diff --cached --name-only"));
  deleted = lines(git("diff --cached --name-only --diff-filter=D"));
  // A merge carries scenes recorded on the other branch. Only what the merge
  // commit itself writes — a file that differs from both parents — is new.
  if (gitOk("rev-parse -q --verify MERGE_HEAD")) {
    const fromTheirs = new Set(lines(git("diff --cached --name-only MERGE_HEAD")));
    files = files.filter(f => fromTheirs.has(f));
  }
} else if (mode === "--branch") {
  // Strict: the scene is what is not yet committed. Adapted: the branch since it forked.
  if (strict) {
    base = "HEAD";
  } else {
    base = argv[1] ?? BASE;
    if (!gitOk(`rev-parse -q --verify ${base}`) || !adopted(base)) process.exit(0);
    base = git(`merge-base ${base} HEAD`).trim();
  }
  files = [...new Set([
    ...lines(git(`diff --name-only ${base}`)),              // committed since base, plus the work tree
    ...lines(git("ls-files --others --exclude-standard")),
  ])];
  deleted = lines(git(`diff --name-only --diff-filter=D ${base}`));
} else {
  fail(`unknown mode ${mode}`);
}

// The compiled record is nobody's doc line: it does not count toward any role.
const has = re => files.some(f => re.test(f) && !RECORD_FILES.test(f));
const missing = [];
if (has(RULES.source)) {
  if (has(TESTED) && !has(RULES.test)) missing.push("no test change");
  for (const part of REQUIRED)
    if (!has(RULES[part])) missing.push(`no ${part} change`);
}
let shared = files.filter(f => RULES.shared.test(f) || (RULES.retired.test(f) && !deleted.includes(f)));

// A release PR: only RELEASE_FILES changed, and the changelog it adds is exactly
// what the compiler produces from the record. The blob must equal compile(sources).
if (mode === "--pr" && shared.length && files.every(f => RELEASE_FILES.test(f))) {
  const added = lines(git(`diff ${base} HEAD -- CHANGELOG.md`))
    .filter(l => l.startsWith("+") && !l.startsWith("+++")).map(l => l.slice(1).trim()).filter(Boolean);
  let compiled, why;
  try {
    const since = sh(`git describe --tags --abbrev=0 ${base}`) || git("rev-list --max-parents=0 HEAD").trim();
    const out = sh(`node ${COMPILER} --dry-run --since ${since}`);
    if (/^\(no task records/.test(out)) why = " (no task records to release)";
    else compiled = lines(out).slice(1);                       // drop the version heading
  } catch { why = " (compiler failed)"; }
  if (compiled && /^## /.test(added[0] ?? "") && same(added.slice(1), compiled)) shared = [];
  else missing.push(`CHANGELOG.md does not equal the compiler's output${why ?? firstDifference(added.slice(1), compiled)}`);
}
if (shared.length) missing.push(`shared file edited directly: ${shared.join(", ")}`);

// The compiled record. A file is compiled once its version at the scene's base carries the
// marker; until then (a new project, the adoption itself) it is an ordinary file.
//   strict : the commit is also the merge, so the scene carries the compiler's output.
//   adapted: a scene does not touch the compiled files; they are compiled on the target
//            after the merge. The one scene that may is the compile itself (nothing but
//            those files), and then they must equal the compiler's output.
const from = base ?? "HEAD";
const record = files.filter(f => RECORD_FILES.test(f) && head(show(from, f)) !== null);
const compileOnly = files.length > 0 && files.every(f => RECORD_FILES.test(f));
if (files.length && existsSync(join(cwd, RECORD_COMPILER))) {
  // The compiler reads the work tree; in --pr that is the checkout of the PR's tip.
  const run = spawnSync(`node ${RECORD_COMPILER} --check`, { cwd, shell: true, encoding: "utf8" });
  if (run.status === 3) missing.push(run.stderr.trim());
  if (strict || compileOnly) {
    if (run.status === 1) missing.push(`compiled record is out of date: ${run.stderr.trim()}`);
    for (const f of record)
      if (!deleted.includes(f) && head(show(from, f)) !== head(contents(f)))
        missing.push(`the hand-written head of ${f} was edited; everything in it is changed by a new decision in a task file`);
    if (mode === "--staged" && !run.status) {
      const unstaged = lines(git("diff --name-only")).filter(f => RECORD_FILES.test(f));
      if (unstaged.length) missing.push(`compiled record not staged: ${unstaged.join(", ")}`);
    }
  } else if (record.length) {
    missing.push(`compiled record edited in this scene: ${record.join(", ")} (write the decision in your task file under "## Decisions"; it is compiled after the merge)`);
  }
  const gone = record.filter(f => deleted.includes(f));
  if (gone.length) missing.push(`compiled record deleted: ${gone.join(", ")}`);
} else if (record.length) {
  missing.push(`compiled record edited directly: ${record.join(", ")}`);
}

// Acceptance boxes in the task files this scene touches.
for (const f of files.filter(f => RULES.task.test(f) && !deleted.includes(f))) {
  let heading = "";
  for (const line of contents(f).split("\n")) {
    if (/^## /.test(line)) heading = line;
    const m = /^\s*[-*] \[[ xX]\]\s+(.+)$/.exec(line);
    // "Done when" boxes of a review describe behaviour and may well start with "the user".
    if (m && !REVIEW_SECTION.test(heading) && ACCEPTANCE_FORBIDDEN.test(m[1].trim()))
      missing.push(`acceptance box in ${f} names an outcome, not a check: "${m[1].trim()}" (make it the promise or a PLAN.md milestone)`);
  }
  // Every record this scene adds names its cold reader.
  const added = addedLines(f);
  for (const section of contents(f).split(/^(?=## )/m)) {
    if (!/^## What was done/.test(section) || !added.has(section.split("\n")[0].trim())) continue;
    if (!REVIEW.test(section) && !REVIEW_EXEMPT.test(section))
      missing.push(`record in ${f} has no "Reviewed by:" line (a reader that has not seen the work; see Appendix G)`);
  }
  // Every review round this scene adds: each item says what was found, when it is done
  // (one box per case, as "case → outcome") and what was not asked. An item with an open
  // box does not merge. Who ticks is not the gate's business; that every case is named is.
  for (const section of contents(f).split(/^(?=## )/m)) {
    if (!REVIEW_SECTION.test(section) || !added.has(section.split("\n")[0].trim())) continue;
    for (const item of section.split(/^(?=### )/m).slice(1)) {
      const name = item.split("\n")[0].replace(/^### /, "").trim();
      const doneWhen = item.split(/^\*\*Done when\*\*/m)[1]?.split(/^\*\*/m)[0] ?? "";
      const boxes = [...doneWhen.matchAll(/^\s*[-*] \[([ xX])\]\s+(.+)$/gm)];
      if (!/^\*\*Found\*\*/m.test(item) || !boxes.length || !/^\*\*Not asked\*\*/m.test(item))
        missing.push(`review item "${name}" in ${f} needs **Found**, **Done when** with a box per case, and **Not asked**`);
      for (const [, , text] of boxes)
        if (!text.includes("→")) missing.push(`review item "${name}" in ${f}: "${text.trim()}" is not "case → outcome"`);
      if (mode === "--pr" && boxes.some(b => b[1] === " ")) missing.push(`review item "${name}" in ${f} is still open`);
    }
  }
}

if (missing.length === 0) process.exit(0);

const what = { "--pr": "This pull request", "--staged": "This commit", "--branch": strict ? "This change" : "This branch" }[mode];
const reason = `Incomplete scene: ${missing.join("; ")}.`;

if (mode === "--pr") {
  const prefix = process.env.TF_BUILD ? "##vso[task.logissue type=error]" : "";
  console.error(`${prefix}${reason}`);
  console.error(`${what} cannot merge until its change carries its record (see tasks/README.md).`);
  process.exit(1);
}

if (strict) {
  const note = `${reason} Complete the record in this same change, or revert it. Do not leave it for later.`;
  // Stop, second pass: the agent was already sent back once. Let the turn end,
  // but make the half-scene visible to the person; the revert is theirs to decide.
  if (input.hook_event_name === "Stop" && input.stop_hook_active) {
    console.log(JSON.stringify({ systemMessage: note }));
    process.exit(0);
  }
  console.error(note);
  process.exit(2);   // PreToolUse: deny the commit. Stop: send the agent back. pre-commit: refuse.
}

const note = `${reason} ${what} is fine to keep, but the pull request will be refused until it is complete.`;
if (input.hook_event_name === "Stop") {
  // Advise the agent once, in its own context, so it can act; never refuse the scene.
  // Claude Code takes the note as additionalContext. Codex has no such field at Stop: its
  // one channel to the agent is to continue the turn with the note as the prompt.
  if (input.stop_hook_active)
    console.log(JSON.stringify({ systemMessage: note }));
  else if (codex)
    console.log(JSON.stringify({ decision: "block", reason: note }));
  else
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "Stop", additionalContext: note } }));
} else {
  console.error(note);
}
process.exit(0);

function adopted(ref) { return gitOk(`cat-file -e ${ref}:${SELF}`); }
function addedLines(file) {  // lines this scene adds to the file
  let diff;
  if (mode === "--pr") diff = git(`diff ${base} HEAD -- ${file}`);
  else if (mode === "--staged") diff = git("diff --cached -- " + file);
  else if (gitOk(`ls-files --error-unmatch ${file}`)) diff = git(`diff ${base} -- ${file}`);
  else return new Set(lines(contents(file)));            // untracked: all of it is new
  return new Set(lines(diff).filter(l => l.startsWith("+") && !l.startsWith("+++")).map(l => l.slice(1).trim()));
}
function contents(file) {   // the file as this scene has it
  try {
    if (mode === "--pr") return git(`show HEAD:${file}`);
    if (mode === "--staged") return git(`show :${file}`);
    return readFileSync(join(cwd, file), "utf8");
  } catch { return ""; }
}
function show(ref, file) {   // the file as the scene's base has it; "" if absent
  try { return git(`show ${ref}:${file}`); } catch { return ""; }
}
function head(text) {        // the part above the compile marker; null if the file is not compiled
  const i = text.indexOf(RECORD_MARKER);
  return i < 0 ? null : text.slice(0, i).trimEnd();
}
function skip(message) { console.log(message); process.exit(0); }
function fail(message) { console.error(message); process.exit(2); }
function same(a, b) { return a.length === b.length && a.every((l, i) => l === b[i]); }
function firstDifference(a, b) {
  const i = a.findIndex((l, i) => l !== b[i]);
  const at = i < 0 ? a.length : i;
  return `\n  PR line ${at + 1}: ${JSON.stringify(a[at] ?? "(end)")}\n  compiled: ${JSON.stringify(b[at] ?? "(end)")}`;
}
function git(args) {
  return execSync(`git ${args}`, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}
function sh(cmd) {
  return execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}
function gitOk(args) {
  try { execSync(`git ${args}`, { cwd, stdio: "ignore" }); return true; }
  catch { return false; }
}
function readStdin() {
  return new Promise(r => {
    let s = "";
    process.stdin.on("data", d => s += d).on("end", () => r(s));
  });
}
