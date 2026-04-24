# Command Redesign: Hooks, Subagents, and Code Reviews

**Date:** 2026-04-24  
**Goal:** Reduce wall-clock time, reduce token usage, prevent skipped steps, enforce build/lint, and add command-controlled code reviews.

---

## 1. Hooks

### 1.1 New: PreToolUse — enforce build/lint before push

Add to `.claude/settings.json` under `hooks.PreToolUse`:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "if": "Bash(git push*)",
      "command": "cd /Users/johnhschneider/dev/vercel-cert && pnpm build && pnpm lint",
      "statusMessage": "Enforcing build + lint before push...",
      "asyncRewake": true
    }
  ]
}
```

If the hook exits non-zero, Claude sees the failure output and must fix it before the push proceeds. This is a hard gate that fires regardless of which command triggered the push.

### 1.2 Unchanged

The existing `PostToolUse` hydration check after `pnpm build` and `gh pr create` stays as-is.

---

## 2. Parallelism via Subagents

All multi-unit workflows dispatch parallel subagents using `superpowers:dispatching-parallel-agents`. Single-unit invocations stay direct to avoid subagent overhead.

### 2.1 `groom.md`

**Current:** Sequential loop over all Grooming tickets.  
**New:** When multiple tickets are found, dispatch one subagent per ticket. Each subagent receives: the ticket key, the Atlassian cloud ID, and the full groom instructions. Single-ticket invocations run directly.

### 2.2 `groom-epic.md`

**Current:** Sequentially calls `Skill("groom", args="<KEY>")` per child story — incorrect (groom is a command, not a skill).  
**New:** After fetching all child stories, filter to those in Grooming status, then dispatch one subagent per story in parallel. Each subagent receives the groom instructions plus the epic description as shared context. Stories in any other status are skipped.

### 2.3 `solution-review.md`

**Current:** Runs all 7 audit dimensions sequentially in main context, dumping ~200 lines of grep output.  
**New:** Dispatch 7 parallel subagents (one per dimension). Each returns a structured result: `{ dimension, rating, issues[] }`. The main agent collates results into the summary table and issue list. This protects the main context from grep noise and cuts runtime ~7x.

### 2.4 `start-dev.md`

**Current:** Mentions parallel agents in Step 3 but does not reference the dispatching skill.  
**New:** Explicitly invokes `superpowers:dispatching-parallel-agents` when multiple Dev Ready tickets are found. Each subagent handles Steps 4–9 (worktree → implement → code review → PR → cleanup) independently. Single-ticket invocations run directly.

### 2.5 `fix-issue.md` Story Flow

No parallelism change. Bugs in the Story Flow all land on the same branch and often touch overlapping files; sequential is correct-by-default here. Bug Flow (independent branch, single ticket) already runs directly.

---

## 3. Code Reviews

### 3.1 Review trigger rules (command-controlled)

| Command | Review? | Timing |
|---------|---------|--------|
| `pr.md` | Always | Before PR creation, after build/lint pass |
| `start-dev.md` | Always | After build passes, before PR creation |
| `start-epic-dev.md` | Always | After all stories implemented and build passes, before PR |
| `fix-issue.md` Bug Flow | Always | After build passes, before PR |
| `fix-issue.md` Story Flow | No | PR already reviewed at creation; incremental push reviewed by human |
| `pr-feedback.md` | No | Already responding to reviewer comments |
| `groom.md` / `groom-epic.md` / `solution-review.md` | No | No production code changes |

### 3.2 Review scope discipline

Every review subagent receives only the diff for changed files:

```bash
git diff <base>...HEAD --name-only   # identify changed files
git diff <base>...HEAD               # pass to reviewer
```

The reviewer is invoked as a `pr-review-toolkit:code-reviewer` subagent. It never reviews the full codebase.

### 3.3 Review failure flow

1. Review runs → finds issues.
2. Agent fixes all issues it can resolve independently.
3. Re-runs `pnpm build` and `pnpm lint` to verify fixes.
4. Re-runs review to confirm issues resolved.
5. If clean → proceeds to PR.
6. If unresolved questions remain → transitions Jira ticket to **BLOCKED**, posts a comment with:
   - What was attempted
   - What issues remain unresolved
   - Specific questions requiring human input
   - Stops. Does not create PR.

Reuses the existing `BLOCKED` status (no board changes). The comment format makes the reason distinguishable from a grooming block: "Code review blocked — [issues + questions]".

---

## 4. Deduplication and Cleanup

### 4.1 Fix broken file references

Both `fix-issue.md` (Step 5B) and `start-dev.md` (Step 8) reference `.claude/commands/pull-request.md` — this file does not exist. Correct path: `.claude/commands/pr.md`. Both files updated.

### 4.2 `start-epic-dev.md` delegates to `pr.md`

Current Steps 7–8 contain ~60 lines of inline PR creation logic that duplicates `pr.md`. Replace with: "Run the `/pr` workflow from the epic branch. The workflow auto-detects Jira ticket keys from commit messages and handles version bump, push, Vercel detection, PR creation, and Jira updates."

### 4.3 `groom-epic.md` dispatch pattern corrected

Remove the incorrect `Skill("groom", args="<KEY>")` call. Replace with parallel subagent dispatch (per Section 2.2 above).

---

## 5. Files Changed

| File | Change |
|------|--------|
| `.claude/settings.json` | Add PreToolUse hook for git push |
| `.claude/commands/groom.md` | Parallel subagent dispatch for multi-ticket |
| `.claude/commands/groom-epic.md` | Parallel subagent dispatch; fix Skill() call |
| `.claude/commands/solution-review.md` | 7 parallel audit subagents |
| `.claude/commands/start-dev.md` | Use dispatching skill; fix `pull-request.md` ref; add code review step |
| `.claude/commands/start-epic-dev.md` | Delegate to `pr.md`; add code review step |
| `.claude/commands/fix-issue.md` | Fix `pull-request.md` ref; add code review step to Bug Flow |
| `.claude/commands/pr.md` | Add code review step before PR creation |

---

## 6. Out of Scope

- No new Jira statuses (reuse `BLOCKED`)
- No changes to `pr-feedback.md` or `solution-review.md` Jira triage flow
- No changes to `fix-issue.md` Story Flow parallelism
