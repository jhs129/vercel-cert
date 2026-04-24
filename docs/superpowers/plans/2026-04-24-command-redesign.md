# Command Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `.claude/commands/` to enforce build/lint via hooks, parallelize independent work via subagents, and add command-controlled code reviews on every PR and non-trivial development command.

**Architecture:** One PreToolUse hook enforces build+lint before every push. The `pr.md` command gains a code review step that is automatically inherited by all commands that delegate to it. Sequential ticket/audit loops in `groom.md`, `groom-epic.md`, and `solution-review.md` are replaced with parallel subagent dispatch. Broken file references and one duplicated PR-creation block are cleaned up.

**Tech Stack:** Claude Code command files (Markdown), `.claude/settings.json` (JSON), `superpowers:dispatching-parallel-agents` skill, `pr-review-toolkit:code-reviewer` subagent.

---

## File Map

| File | Change |
|------|--------|
| `.claude/settings.json` | Add `PreToolUse` hook blocking `git push` if build/lint fail |
| `.claude/commands/pr.md` | Insert code review step (new Step 5); renumber old Steps 5–11 to 6–12 |
| `.claude/commands/groom.md` | Replace sequential Step 2 loop with parallel subagent dispatch |
| `.claude/commands/groom-epic.md` | Replace sequential Skill() calls in Step 3 with parallel subagent dispatch |
| `.claude/commands/solution-review.md` | Replace sequential Step 1 audit with 7 parallel subagents; Step 2+ unchanged |
| `.claude/commands/start-dev.md` | Make Step 3 explicit: invoke `superpowers:dispatching-parallel-agents`; fix `pull-request.md` → `pr.md` ref in Step 8 |
| `.claude/commands/fix-issue.md` | Fix `pull-request.md` → `pr.md` ref in Step 5B |
| `.claude/commands/start-epic-dev.md` | Remove duplicate version-bump/push/Vercel-detection code from Steps 7–8; add code review step before PR creation; keep custom PR body and multi-story Jira updates |

---

## Task 1: Add PreToolUse build+lint hook to settings.json

**Files:**
- Modify: `.claude/settings.json`

- [ ] **Step 1: Read the current settings file**

  ```bash
  cat /Users/johnhschneider/dev/vercel-cert/.claude/settings.json
  ```

- [ ] **Step 2: Add the PreToolUse section**

  The current file has only a `PostToolUse` key inside `hooks`. Add a `PreToolUse` key at the same level. The complete updated `hooks` object:

  ```json
  "hooks": {
    "PreToolUse": [
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
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(pnpm build*)",
            "command": "cd /Users/johnhschneider/dev/vercel-cert && node scripts/check-hydration.mjs",
            "statusMessage": "Checking for hydration errors...",
            "asyncRewake": true
          },
          {
            "type": "command",
            "if": "Bash(gh pr create*)",
            "command": "cd /Users/johnhschneider/dev/vercel-cert && node scripts/check-hydration.mjs",
            "statusMessage": "Checking for hydration errors before PR...",
            "asyncRewake": true
          }
        ]
      }
    ]
  }
  ```

- [ ] **Step 3: Verify the file is valid JSON**

  ```bash
  node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8')); console.log('valid')"
  ```

  Expected output: `valid`

- [ ] **Step 4: Commit**

  ```bash
  git add .claude/settings.json
  git commit -m "feat: enforce build+lint before git push via PreToolUse hook"
  ```

---

## Task 2: Add code review step to pr.md

**Files:**
- Modify: `.claude/commands/pr.md`

This inserts a new Step 5 (Code Review) between the existing Step 4 (Create Test Page) and Step 5 (Determine Next PR Number). Old Steps 5–11 become Steps 6–12.

The code review step is defined once here. `start-dev.md`, `fix-issue.md` Bug Flow, and `start-epic-dev.md` all delegate to `pr.md` for PR creation, so they inherit this review automatically.

- [ ] **Step 1: Insert new Step 5 after the current Step 4 block**

  Find the line `## Step 5: Determine the Next PR Number and Update the Version` in `pr.md`. Insert the following block **immediately before** it:

  ````markdown
  ## Step 5: Code Review

  Get all changes on this branch:
  ```bash
  git diff main...HEAD --name-only
  git diff main...HEAD
  ```

  Dispatch a `pr-review-toolkit:code-reviewer` subagent. Pass it:
  - The full output of `git diff main...HEAD`
  - The changed file list from `git diff main...HEAD --name-only`
  - This context: "Next.js 16 App Router project. Key conventions in CLAUDE.md: use Tailwind CSS tokens (never hardcode hex or arbitrary `bg-[#xxx]`), server/client split pattern (`page.tsx` → `*Client.tsx`), Builder.io must use `@builder.io/sdk-react` only (never `@builder.io/react`), components >100 lines split into directory `components/[Name]/index.tsx`."

  **If no blockers found:** Proceed to Step 6.

  **If blockers found:**
  1. Fix every issue that can be resolved without human judgment: naming, style, missing error handling, CLAUDE.md convention violations, type issues.
  2. Run: `pnpm build && pnpm lint` — fix any errors before continuing.
  3. Re-dispatch the `pr-review-toolkit:code-reviewer` subagent on the updated diff.
  4. If clean → proceed to Step 6.
  5. If questions remain that require human judgment:
     - If a Jira ticket was found in Step 2:
       ```
       getTransitionsForJiraIssue(cloudId="c546b8b8-c5e9-4677-8322-7a935c3d3860", issueIdOrKey="<ticket-key>")
       transitionJiraIssue(cloudId="c546b8b8-c5e9-4677-8322-7a935c3d3860", issueIdOrKey="<ticket-key>", transitionId="<blocked-id>")
       addCommentToJiraIssue(
         cloudId="c546b8b8-c5e9-4677-8322-7a935c3d3860",
         issueIdOrKey="<ticket-key>",
         contentFormat="markdown",
         commentBody="**Code review blocked PR creation.**\n\n**Issues fixed automatically:**\n- <list each fix>\n\n**Unresolved — human input needed:**\n- <list each remaining issue with a specific question>\n\nPlease address these and re-run `/pr`."
       )
       ```
     - **Stop.** Do not push or create a PR.

  ````

- [ ] **Step 2: Renumber old Steps 5–11 to Steps 6–12**

  Do a find-and-replace in `pr.md` for each heading in order (go in reverse to avoid double-renaming):
  - `## Step 11:` → `## Step 12:`
  - `## Step 10:` → `## Step 11:`
  - `## Step 9:` → `## Step 10:`
  - `## Step 8:` → `## Step 9:`
  - `## Step 7:` → `## Step 8:`
  - `## Step 6:` → `## Step 7:`
  - `## Step 5:` → `## Step 6:`

  Also update the Notes section reference: "If there are uncommitted changes..." — no step references there, so no change needed.

- [ ] **Step 3: Verify step numbering is correct**

  ```bash
  grep "^## Step" .claude/commands/pr.md
  ```

  Expected output (in order):
  ```
  ## Step 1: Read the Current Branch and Git State
  ## Step 2: Fetch the Jira Ticket (if applicable)
  ## Step 3: Verify the Build is Clean
  ## Step 4: Create the Test Page (if applicable)
  ## Step 5: Code Review
  ## Step 6: Determine the Next PR Number and Update the Version
  ## Step 7: Push the Branch
  ## Step 8: Detect the Vercel Preview Deployment
  ## Step 9: Build the PR Title and Body
  ## Step 10: Create the PR
  ## Step 11: Update the Jira Ticket (if applicable)
  ## Step 12: Show the Result
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add .claude/commands/pr.md
  git commit -m "feat: add code review step to pr.md before PR creation"
  ```

---

## Task 3: Parallel subagent dispatch in groom.md

**Files:**
- Modify: `.claude/commands/groom.md`

- [ ] **Step 1: Replace Step 2 with parallel dispatch instructions**

  Find and replace the entire `## Step 2: Process Each Ticket` block:

  **Current text (exact):**
  ```markdown
  ## Step 2: Process Each Ticket

  For each ticket, perform steps 3–7. If processing multiple tickets, work through them sequentially.
  ```

  **Replace with:**
  ```markdown
  ## Step 2: Process Tickets

  **Single ticket:** Proceed directly to Steps 3–7 in this session.

  **Multiple tickets:** Invoke `superpowers:dispatching-parallel-agents`. Dispatch one subagent per ticket simultaneously. Each subagent prompt must include:
  - The specific ticket key to groom
  - The Atlassian cloud ID (obtained in Step 1)
  - The complete instructions from Steps 3–7 of this document, verbatim
  - Jira base URL: `https://jhsdc.atlassian.net/browse/`
  - Project key: `VS`
  - Cloud ID: `c546b8b8-c5e9-4677-8322-7a935c3d3860`

  Wait for all subagents to complete. Collect each subagent's result (ticket key, final status, assumption count, question count, AC count) for the Step 8 Summary.
  ```

- [ ] **Step 2: Verify the edit looks correct**

  ```bash
  grep -A 20 "^## Step 2" .claude/commands/groom.md
  ```

  Confirm the new text appears and the old "work through them sequentially" wording is gone.

- [ ] **Step 3: Commit**

  ```bash
  git add .claude/commands/groom.md
  git commit -m "feat: parallel subagent dispatch for multi-ticket grooming"
  ```

---

## Task 4: Parallel dispatch in groom-epic.md + fix Skill() call

**Files:**
- Modify: `.claude/commands/groom-epic.md`

- [ ] **Step 1: Replace Step 3 with corrected parallel dispatch**

  Find and replace the entire `## Step 3: Groom Each Story` block.

  **Current text (exact):**
  ```markdown
  ## Step 3: Groom Each Story

  For each child story, invoke the `/groom` skill passing the story key as the argument. Before each invocation, output a progress header:

  ```
  ---
  Grooming <KEY> (<n> of <total>): <summary>
  ---
  ```

  Then invoke:
  ```
  Skill("groom", args="<KEY>")
  ```

  The epic description is already in your context — use it to inform each story's grooming. When drafting assumptions and acceptance criteria for a story, make sure they are consistent with the epic's stated goal and scope. Note any story that appears to conflict with the epic description and flag it in that story's grooming comment.

  Continue through all stories sequentially. Do not stop early unless a story errors out — if one fails, note the failure and continue to the next.
  ```

  **Replace with:**
  ````markdown
  ## Step 3: Groom Stories in Parallel

  Filter child stories to only those in **To Do** or **Grooming** status. Stories already in Requirements Review, Dev Ready, In Progress, In Review, or Done are skipped — note them in the Step 4 summary as "skipped — already past Grooming."

  If no stories remain after filtering, report and stop.

  Invoke `superpowers:dispatching-parallel-agents`. Dispatch one subagent per eligible story. Each subagent prompt must include:

  1. The specific story key (e.g., `VS-12`)
  2. The Atlassian cloud ID: `c546b8b8-c5e9-4677-8322-7a935c3d3860`
  3. The epic description (copy it verbatim from Step 1 output) — the subagent must use this to ensure the story's AC is consistent with the epic goal. Any story that appears to conflict with the epic must have the conflict flagged in its grooming Jira comment.
  4. The complete grooming instructions (Steps 3–7 from `.claude/commands/groom.md`), verbatim
  5. Jira base URL: `https://jhsdc.atlassian.net/browse/`
  6. Project key: `VS`

  Wait for all subagents to complete. Collect each result (story key, final status, error if any) for the Step 4 Summary.
  ````

- [ ] **Step 2: Verify the old Skill() call is gone**

  ```bash
  grep -n "Skill(" .claude/commands/groom-epic.md
  ```

  Expected output: no matches.

- [ ] **Step 3: Commit**

  ```bash
  git add .claude/commands/groom-epic.md
  git commit -m "feat: parallel subagent dispatch for epic grooming; fix incorrect Skill() call"
  ```

---

## Task 5: Parallel audit subagents in solution-review.md

**Files:**
- Modify: `.claude/commands/solution-review.md`

This replaces the entire `## Step 1: Audit the Codebase` section (and its 7 subsections) with a parallel dispatch. Steps 2–5 are unchanged.

- [ ] **Step 1: Replace the Step 1 block**

  Find the `## Step 1: Audit the Codebase` heading and everything under it up to (but not including) `## Step 2: Compile and Present Results`. Replace with:

  ````markdown
  ## Step 1: Dispatch Parallel Audit Subagents

  Invoke `superpowers:dispatching-parallel-agents` with 7 subagents — one per dimension. Each subagent runs its assigned bash commands, reads relevant files, and returns a structured result object.

  **Required result format for every subagent:**
  ```json
  {
    "dimension": "<number> — <name>",
    "rating": "✅ Pass | ⚠️ Gap | ❌ Missing",
    "summary": "one-line description of the finding",
    "issues": [
      {
        "title": "short plain-English title",
        "files": ["path/to/file.tsx"],
        "problem": "one sentence: what is wrong",
        "fix": "one sentence: what the best-practice fix is"
      }
    ],
    "teachingNote": "the 'What to teach' text from the dimension instructions below"
  }
  ```

  ---

  ### Subagent 1 — Caching Strategy

  Run:
  ```bash
  grep -rn "use cache\|cacheLife\|cacheTag\|revalidate\|unstable_cache\|cache()" app/ lib/ --include="*.ts" --include="*.tsx"
  ```

  Look for: Is `"use cache"` applied to data-fetching functions in `lib/`? Are `cacheLife` / `cacheTag` used? Are Builder.io fetch calls instrumented with cache directives, or always dynamic? Are user-specific routes correctly *not* cached?

  Teaching note: *In Next.js 16, `"use cache"` is the successor to `fetch` cache options and `unstable_cache`. It turns a function into a cached computation whose result is stored on the server. `cacheLife` sets expiry (e.g. `cacheLife("hours")`). `cacheTag` lets you invalidate groups of cached results with `revalidateTag()`. Cache the expensive, shared, rarely-changing data; keep dynamic data (user sessions, real-time counts) uncached.*

  ---

  ### Subagent 2 — Component Architecture

  Run:
  ```bash
  grep -rn '"use client"' app/ components/ --include="*.tsx"
  grep -rn '"use server"' app/ --include="*.ts" --include="*.tsx"
  ```
  Also read `app/layout.tsx` and each `app/*/page.tsx`.

  Look for: Are `page.tsx` files async Server Components that pass data as props? Is `"use client"` only on components needing browser APIs, event handlers, or state? Are there `"use client"` components with data-fetching that could move to the server? Is the `page.tsx` → `*Client.tsx` split applied consistently?

  Teaching note: *Server Components run only on the server — they can `await` database calls, read env vars, and never ship code to the browser. `"use client"` creates a boundary: everything below it runs in the browser. Push that boundary as far down the tree as possible. A common mistake is marking a whole page `"use client"` because one interactive element needs it — extract just the interactive piece into a `*Client.tsx` component instead.*

  ---

  ### Subagent 3 — Suspense & Streaming

  Run:
  ```bash
  grep -rn "Suspense" app/ components/ --include="*.tsx"
  find /Users/johnhschneider/dev/vercel-cert/app -name "loading.tsx"
  find /Users/johnhschneider/dev/vercel-cert/app -name "error.tsx"
  ```

  Look for: Are async Server Components wrapped in `<Suspense fallback={...}>`? Are there `loading.tsx` files for route-level streaming? Do dynamic components show skeleton/fallback UI? Are `<Suspense>` boundaries granular (per-section) or only at route level?

  Teaching note: *Streaming lets the browser start rendering before all data is ready. Each `<Suspense>` boundary is a seam — Next.js flushes the static shell immediately and streams each boundary's content as it resolves. `loading.tsx` is syntactic sugar that wraps the page in a `<Suspense>` automatically. Granular boundaries (one per independently-fetchable section) give the best perceived performance.*

  ---

  ### Subagent 4 — Server Actions & Forms

  Run:
  ```bash
  grep -rn '"use server"' app/ --include="*.ts" --include="*.tsx"
  grep -rn "action=" app/ --include="*.tsx"
  grep -rn "<form" app/ --include="*.tsx"
  ```

  Look for: Does the app have mutation surfaces (contact forms, newsletter signup, search)? Are they handled via Server Actions (`async function` with `"use server"`)? Are forms using `<form action={serverAction}>` or `useActionState`?

  Teaching note: *Server Actions are async functions marked `"use server"` that run exclusively on the server. They can be passed directly as a `<form action>` — the form works even before JavaScript loads (progressive enhancement). For a read-only app with no mutations, this dimension is N/A — note that clearly.*

  ---

  ### Subagent 5 — Metadata & SEO

  Run:
  ```bash
  grep -rn "generateMetadata\|export const metadata" app/ --include="*.tsx" --include="*.ts"
  grep -rn "openGraph\|twitter\|canonical\|metadataBase" app/ --include="*.tsx" --include="*.ts"
  ```

  Look for: Is there a root `metadata` export in `layout.tsx` with title, description, OG image, and `metadataBase`? Do dynamic routes use `generateMetadata`? Is OG data complete: `title`, `description`, `url`, `images`? Are Twitter/X card tags present? Is `metadataBase` set?

  Teaching note: *`metadata` (static) and `generateMetadata` (dynamic) are Next.js's way of injecting `<head>` content. For dynamic pages, `generateMetadata` receives the same `params` as the page and can fetch CMS data. The `metadataBase` in the root layout tells Next.js how to resolve relative image paths in metadata — without it, OG image URLs break when shared on social platforms.*

  ---

  ### Subagent 6 — Data Fetching Patterns

  Run:
  ```bash
  grep -rn "generateStaticParams\|Promise.all\|notFound()" app/ --include="*.tsx" --include="*.ts"
  grep -rn "params\b" app/ --include="*.tsx" | grep "async\|await" | head -20
  ```
  Also read each `app/*/page.tsx` to check fetch patterns.

  Look for: Is `Promise.all` used when multiple independent fetches happen in the same component? Is `generateStaticParams` used on `[slug]` routes? Is `notFound()` called when a fetch returns no content? Are `params` properly awaited (Next.js 16 requires `await params`)?

  Teaching note: *`Promise.all` runs fetches in parallel — two sequential `await` calls take `A + B` ms, while `Promise.all([fetchA(), fetchB()])` takes `max(A, B)` ms. `generateStaticParams` turns dynamic routes into static files served from the edge. `notFound()` returns a proper 404; without it, empty pages silently return 200, which is bad for SEO.*

  ---

  ### Subagent 7 — Code Quality & Polish

  Run:
  ```bash
  pnpm lint 2>&1 | head -60
  grep -rn "\bany\b" app/ components/ lib/ --include="*.tsx" --include="*.ts" | grep -v "//.*any\|eslint-disable" | head -20
  grep -rn "sm:\|md:\|lg:\|xl:" components/ --include="*.tsx" -l
  find /Users/johnhschneider/dev/vercel-cert/app -name "error.tsx"
  grep -rn "#[0-9a-fA-F]\{3,6\}\|rgb(\|rgba(" app/ components/ --include="*.tsx" --include="*.css" | grep -v "globals.css\|shadcn"
  ```

  Look for: Does `pnpm lint` pass clean? Are there `any` types? Do components use responsive Tailwind classes (`sm:`, `md:`, `lg:`)? Are there `error.tsx` files? Are hardcoded hex/RGB values used instead of CSS tokens?

  Teaching note: *Error boundaries (`error.tsx`) prevent one broken route from crashing the whole app. `any` types defeat TypeScript's purpose. Responsive classes are non-negotiable for production. Hardcoded colors make theming impossible.*

  ---

  After all 7 subagents complete, collect their result objects and proceed to Step 2.
  ````

- [ ] **Step 2: Verify the old sequential bash blocks are gone and the new structure is present**

  ```bash
  grep -n "^### [0-9]" .claude/commands/solution-review.md | head -20
  ```

  Should show `### Subagent 1` through `### Subagent 7`.

  ```bash
  grep -c "look for\|Look for" .claude/commands/solution-review.md
  ```

  Should return `7` (one per subagent).

- [ ] **Step 3: Commit**

  ```bash
  git add .claude/commands/solution-review.md
  git commit -m "feat: parallel subagent dispatch for 7 audit dimensions in solution-review"
  ```

---

## Task 6: Explicit dispatching skill + fix ref in start-dev.md

**Files:**
- Modify: `.claude/commands/start-dev.md`

Two changes: (a) make Step 3 explicitly invoke the dispatching skill, (b) fix the broken `pull-request.md` reference in Step 8.

- [ ] **Step 1: Update Step 3 to explicitly invoke the dispatching skill**

  Find and replace the `## Step 3: Process Each Ticket` block:

  **Current text (exact):**
  ```markdown
  ## Step 3: Process Each Ticket

  If multiple tickets: dispatch one parallel agent per ticket (using the superpowers dispatching pattern). Each agent handles steps 4–9 for its assigned ticket independently.

  If a single ticket: perform steps 4–9 directly.
  ```

  **Replace with:**
  ```markdown
  ## Step 3: Process Each Ticket

  **Single ticket:** Perform Steps 4–9 directly in this session.

  **Multiple tickets:** Invoke `superpowers:dispatching-parallel-agents`. Dispatch one subagent per ticket. Each subagent prompt must include:
  - The specific ticket key
  - The Atlassian cloud ID (from Step 1)
  - The Vercel project name: `vercel-cert`
  - The main repo root path (use `git rev-parse --show-toplevel` if needed)
  - The complete instructions from Steps 4–9 of this document, verbatim

  Wait for all subagents to complete, then display the Step 10 Summary with collated results.
  ```

- [ ] **Step 2: Fix the broken file reference in Step 8**

  Find and replace in `start-dev.md`:

  **Current text:**
  ```
  Follow all steps in `.claude/commands/pull-request.md`.
  ```

  **Replace with:**
  ```
  Follow all steps in `.claude/commands/pr.md`.
  ```

- [ ] **Step 3: Verify both changes**

  ```bash
  grep -n "pull-request.md" .claude/commands/start-dev.md
  ```
  Expected: no output (reference removed).

  ```bash
  grep -n "dispatching-parallel-agents\|superpowers:dispatching" .claude/commands/start-dev.md
  ```
  Expected: the new Step 3 text appears.

- [ ] **Step 4: Commit**

  ```bash
  git add .claude/commands/start-dev.md
  git commit -m "fix: explicit dispatching-parallel-agents in start-dev; fix pr.md reference"
  ```

---

## Task 7: Fix broken reference in fix-issue.md

**Files:**
- Modify: `.claude/commands/fix-issue.md`

- [ ] **Step 1: Fix the reference in Step 5B**

  Find and replace in `fix-issue.md`:

  **Current text (exact):**
  ```
  Follow all steps in `.claude/commands/pull-request.md`.
  ```

  **Replace with:**
  ```
  Follow all steps in `.claude/commands/pr.md`.
  ```

- [ ] **Step 2: Verify**

  ```bash
  grep -n "pull-request.md" .claude/commands/fix-issue.md
  ```
  Expected: no output.

  ```bash
  grep -n "pr.md" .claude/commands/fix-issue.md
  ```
  Expected: the corrected reference appears.

- [ ] **Step 3: Commit**

  ```bash
  git add .claude/commands/fix-issue.md
  git commit -m "fix: correct pr.md reference in fix-issue.md Bug Flow"
  ```

---

## Task 8: Deduplicate PR creation + add code review in start-epic-dev.md

**Files:**
- Modify: `.claude/commands/start-epic-dev.md`

The current Step 7 duplicates version-bump + push + Vercel-detection logic from `pr.md`. Those shared steps are extracted and replaced with references to `pr.md`. The custom epic PR body and multi-story Jira updates stay in place. A code review step is added before PR creation.

- [ ] **Step 1: Replace Step 7 with a leaner version**

  Find and replace the `## Step 7: Create the Pull Request` block. The current block runs from `## Step 7:` to (but not including) `## Step 8:`.

  **Replace the entire Step 7 with:**

  ````markdown
  ## Step 7: Code Review

  Get all changes on this branch:
  ```bash
  git diff main...HEAD --name-only
  git diff main...HEAD
  ```

  Dispatch a `pr-review-toolkit:code-reviewer` subagent. Pass it:
  - The full output of `git diff main...HEAD`
  - The changed file list
  - Context: "Next.js 16 App Router project. See CLAUDE.md for conventions: Tailwind tokens, server/client split, Builder.io uses `@builder.io/sdk-react` only, components >100 lines split into directory."

  **If no blockers found:** Proceed to Step 8.

  **If blockers found:**
  1. Fix every issue resolvable without human judgment.
  2. Run `pnpm build && pnpm lint`.
  3. Re-dispatch the reviewer on the updated diff.
  4. If clean → proceed to Step 8.
  5. If unresolved questions remain:
     - Transition the **epic** Jira ticket to Blocked:
       ```
       getTransitionsForJiraIssue(cloudId="c546b8b8-c5e9-4677-8322-7a935c3d3860", issueIdOrKey="$ARGUMENTS")
       transitionJiraIssue(cloudId="c546b8b8-c5e9-4677-8322-7a935c3d3860", issueIdOrKey="$ARGUMENTS", transitionId="<blocked-id>")
       addCommentToJiraIssue(
         cloudId="c546b8b8-c5e9-4677-8322-7a935c3d3860",
         issueIdOrKey="$ARGUMENTS",
         contentFormat="markdown",
         commentBody="**Code review blocked PR creation.**\n\n**Issues fixed automatically:**\n- <list>\n\n**Unresolved — human input needed:**\n- <list with specific questions>\n\nPlease address these and re-run `/start-epic-dev $ARGUMENTS`."
       )
       ```
     - **Stop.** Do not create a PR.

  ## Step 8: Create the Pull Request

  **Determine the next PR number** (same as `pr.md` Step 6):
  ```bash
  gh pr list --state all --limit 1 --json number --jq '.[0].number'
  ```
  Next PR = that number + 1. Update `package.json`: keep `MAJOR.MINOR.`, set patch to the PR number.
  ```bash
  git add package.json
  git commit -m "chore: bump version for PR #<number>"
  ```

  **Push the branch** (same as `pr.md` Step 7):
  ```bash
  git push -u origin <branch-name>
  ```

  **Detect the Vercel preview deployment** (same as `pr.md` Step 8 — poll up to 3 minutes, 30-second intervals):
  ```
  list_deployments(projectId="vercel-cert", target="preview", gitBranch="<branch-name>", limit=1)
  get_deployment(deploymentId="<id>")
  ```

  **Build the PR body** — write in first person as John Schneider, direct and friendly.

  Structure:
  ```
  ## Summary
  <2-4 bullet points: what the epic implements and why>

  **Epic:** [$ARGUMENTS: <epic summary>](https://jhsdc.atlassian.net/browse/$ARGUMENTS)

  **Stories in this PR:**
  | Ticket | Summary |
  |--------|---------|
  | [<KEY>](https://jhsdc.atlassian.net/browse/<KEY>) | <summary> |

  **Preview:** <deployment-url>

  ## Changes
  <grouped by component/area, bullet list>

  ## Test Plan
  - [ ] Build passes (`pnpm build`)
  - [ ] <functional check per story AC>
  <for each component with a test page:>
  - [ ] Visit `<deployment-url>/test/<component-slug>` — verify all variants render correctly
  - [ ] Verify equal-height alignment in multi-card stories (if applicable)
  - [ ] Accessibility: run Storybook a11y addon on all new component stories

  🤖 Generated with [Claude Code](https://claude.ai/claude-code)
  ```

  **Create the PR:**
  ```bash
  gh pr create --title "<epic summary (under 70 chars)>" --body "$(cat <<'EOF'
  <body>
  EOF
  )" --base main
  ```
  ````

- [ ] **Step 2: Verify Step 7 and Step 8 look correct**

  ```bash
  grep "^## Step [78]" .claude/commands/start-epic-dev.md
  ```
  Expected: `## Step 7: Code Review` and `## Step 8: Create the Pull Request`.

  ```bash
  grep -n "pull-request.md" .claude/commands/start-epic-dev.md
  ```
  Expected: no output.

- [ ] **Step 3: Commit**

  ```bash
  git add .claude/commands/start-epic-dev.md
  git commit -m "feat: add code review step; deduplicate PR creation in start-epic-dev"
  ```

---

## Final Verification

- [ ] **Confirm all broken references are fixed**

  ```bash
  grep -rn "pull-request.md" .claude/commands/
  ```
  Expected: no output.

- [ ] **Confirm all Skill() calls are removed from groom-epic.md**

  ```bash
  grep -n 'Skill(' .claude/commands/groom-epic.md
  ```
  Expected: no output.

- [ ] **Confirm code review step exists in pr.md and start-epic-dev.md**

  ```bash
  grep -n "Code Review\|code-reviewer" .claude/commands/pr.md .claude/commands/start-epic-dev.md
  ```
  Expected: matches in both files.

- [ ] **Confirm dispatching-parallel-agents appears in all parallel commands**

  ```bash
  grep -rn "dispatching-parallel-agents" .claude/commands/
  ```
  Expected: matches in `groom.md`, `groom-epic.md`, `solution-review.md`, `start-dev.md`.

- [ ] **Confirm settings.json is valid JSON with PreToolUse hook**

  ```bash
  node -e "const s=JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8')); console.log('PreToolUse hooks:', s.hooks.PreToolUse.length, '| PostToolUse hooks:', s.hooks.PostToolUse.length)"
  ```
  Expected: `PreToolUse hooks: 1 | PostToolUse hooks: 1`
