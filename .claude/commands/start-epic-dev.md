# Start Epic Development

Fetch a Jira epic and all its child stories in "Dev Ready" state, build an integrated dependency-aware implementation plan, implement everything on a single branch, and open one PR that covers the whole epic.

The epic to develop: $ARGUMENTS

If $ARGUMENTS is empty, stop and ask for an epic key.

---

## Step 1: Fetch the Epic and Its Dev Ready Stories

Get the Atlassian cloud ID:
```
getAccessibleAtlassianResources()
```

Fetch the epic:
```
getJiraIssue(
  cloudId="...",
  issueIdOrKey="$ARGUMENTS",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter", "comment"]
)
```

If the issue is not found or is not an Epic, report the problem and stop.  If the epic is found, move the epic into "In Progress State"

Find all child stories:
```
searchJiraIssuesUsingJql(
  cloudId="...",
  jql="project = VS AND parent = $ARGUMENTS ORDER BY created ASC",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter", "comment"]
)
```

If that returns no results, try:
```
searchJiraIssuesUsingJql(
  cloudId="...",
  jql="project = VS AND \"Epic Link\" = $ARGUMENTS ORDER BY created ASC",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter", "comment"]
)
```

Filter the results to only stories in **Dev Ready** status. If none are in Dev Ready, report that and stop.

For each Dev Ready story, fetch its full ticket to get complete requirements and acceptance criteria:
```
getJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields=["summary", "description", "issuetype", "status", "comment"]
)
```

Display a summary before proceeding:
```
📋 Epic: $ARGUMENTS — <epic summary>

Dev Ready stories (<count>):
  1. <KEY> — <summary>
  2. <KEY> — <summary>
  ...

Skipped (not Dev Ready):
  - <KEY> — <summary> [<status>]
```

---

## Step 2: Build an Integrated Implementation Plan

Read the epic description and all story requirements together. Produce a written plan that:

1. **Identifies shared work** — list any types, utilities, CSS tokens, base components, or Builder.io registrations that multiple stories require. These will be implemented once and shared, not duplicated.

2. **Orders stories by dependency** — assign each story to a phase:
   - **Phase 1 — Foundation**: shared types (`lib/`), global CSS additions, shared utilities
   - **Phase 2 — Core components**: leaf-level UI components (no dependencies on other stories' output)
   - **Phase 3 — Composite components**: components that compose Phase 2 components, or Builder.io registrations that depend on Phase 2
   - **Phase 4 — Pages / integration**: route-level work, layout changes, feature assembly

   Within each phase, stories are independent and can be implemented in any order.

3. **Flags conflicts** — if two stories touch the same file in a way that could conflict (e.g., both modify `app/globals.css` or `lib/types.ts`), note this and plan the merge strategy up front.

Print the plan clearly so it is visible before implementation begins, also document the plan in the epic in Jira so that it can be persisted and reviewed.   Steps in the plan that are not related to specific stories create tasks that are child work items related to the epic.:

```
🗂  Implementation Plan — $ARGUMENTS

Shared work (implement once):
  - <item>: needed by <KEY>, <KEY>

Phase 1 — Foundation:
  <KEY>: <summary> → touches <files>

Phase 2 — Core components:
  <KEY>: <summary> → touches <files>

Phase 3 — Composite / Builder registration:
  <KEY>: <summary> → depends on <KEY>

Phase 4 — Pages / integration:
  <KEY>: <summary>

Potential conflicts:
  - <file>: touched by <KEY> and <KEY> — resolve by <strategy>
```

---

## Step 3: Transition All Stories to In Progress

For each Dev Ready story:
```
getTransitionsForJiraIssue(cloudId="...", issueIdOrKey="<key>")
transitionJiraIssue(cloudId="...", issueIdOrKey="<key>", transitionId="<in-progress-id>")
```

Do all transitions before writing any code.

---

## Step 4: Create the Branch

Derive a branch name from the epic key and a short slug of the epic summary:
- `VS-30` "Product Listing Epic" → `vs-30-product-listing`

```bash
git fetch origin main
BRANCH="<epic-key-lowercase>-<slug>"
git checkout -b $BRANCH origin/main
```

All implementation happens on this single branch in the main working directory (no worktrees — everything lands in one PR).

---

## Step 5: Pull Vercel Development Environment Variables

```bash
vercel env pull .env.local --environment=development
```

If the Vercel CLI is not linked, run `vercel link` first.

---

## Step 6: Implement All Stories

Work through the plan from Step 2 in phase order. Within each phase, implement stories sequentially.

For each story:

**a) Read** relevant existing files before touching them.

**b) Implement** only what is needed to satisfy the story's acceptance criteria — no scope creep. Follow all CLAUDE.md conventions:
   - Tailwind tokens (never hardcode hex)
   - Server/client split pattern
   - Builder.io patterns (use `@builder.io/sdk-react`, never `@builder.io/react`)
   - `Themeable` interface for any component that supports themes
   - Split components >100 lines into `components/[Name]/index.tsx` + co-located files

**c) Shared work** — if Step 2 identified shared items, implement them when the first story that needs them is processed. Subsequent stories just import the shared artifact.

**d) Test pages** — if a story creates or modifies a UI component under `components/ui/`, create a test page at `app/test/<component-slug>/page.tsx` that renders representative prop variants. See `start-dev` for the exact pattern.

**e) Commit after each story** with a clear message:
```bash
git add -p   # or specific files
git commit -m "feat(<KEY>): <brief description of what was implemented>"
```

This keeps the git log readable and makes the PR diff self-documenting.

After all stories are implemented, run a full build to catch any integration issues:
```bash
pnpm install
pnpm build
```

Fix all errors before proceeding. Do not create a PR with a failing build.

---

## Step 7: Create the Pull Request

**Determine the next PR number:**
```bash
gh pr list --state all --limit 1 --json number --jq '.[0].number'
```
Next PR = that number + 1. Update `package.json` version: keep `MAJOR.MINOR.`, set patch to the PR number.

```bash
git add package.json
git commit -m "chore: bump version for PR #<number>"
```

**Push the branch:**
```bash
git push -u origin <branch-name>
```

**Detect the Vercel preview deployment** (poll up to 3 minutes, 30-second intervals):
```
list_deployments(projectId="vercel-cert", target="preview", gitBranch="<branch-name>", limit=1)
get_deployment(deploymentId="<id>")
```

**Build the PR body** — write in first person as John Schneider, direct and friendly, not AI-generated sounding.

Structure:
```
## Summary
<2-4 bullet points: what the epic implements and why>

**Epic:** [$ARGUMENTS: <epic summary>](https://jhsdc.atlassian.net/browse/$ARGUMENTS)

**Stories in this PR:**
| Ticket | Summary |
|--------|---------|
| [<KEY>](https://jhsdc.atlassian.net/browse/<KEY>) | <summary> |
| ... | ... |

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
- [ ] <additional checks from AC>

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
```

**Create the PR:**
```bash
gh pr create --title "<epic summary (under 70 chars)>" --body "$(cat <<'EOF'
<body>
EOF
)" --base main
```

---

## Step 8: Update All Jira Stories

For **each** Dev Ready story that was implemented:

**a) Transition to "In Review":**
```
transitionJiraIssue(cloudId="...", issueIdOrKey="<key>", transitionId="<in-review-id>")
```

**b) Assign to the reporter** (use `reporter.accountId` from the ticket):
```
editJiraIssue(cloudId="...", issueIdOrKey="<key>", fields={"assignee": {"accountId": "<reporter-account-id>"}})
```

**c) Add a comment** with the shared PR link and Vercel preview URL (ADF format with real hyperlinks, same pattern as `pr.md` Step 10c). Include a note that this story was implemented as part of the epic PR. If the story produced a test page, include a clickable link to it.

---

## Step 9: Update the Epic in Jira

**a) Transition the epic to "In Review":**
```
getTransitionsForJiraIssue(cloudId="...", issueIdOrKey="$ARGUMENTS")
transitionJiraIssue(cloudId="...", issueIdOrKey="$ARGUMENTS", transitionId="<in-review-id>")
```

**b) Add a comment to the epic** with clickable ADF links covering:
- The PR
- The Vercel preview deployment
- Every test page created (one link per component)
- The /search page or primary route (if a page-level route was implemented)

Use ADF format with real hyperlinks (same pattern as `pr.md` Step 10c). Structure:

```
PR ready for review: <pr-url>

Preview deployment: <deployment-url>

Test pages:
  • <component-name>: <deployment-url>/test/<component-slug>
  • ...

Primary route: <deployment-url>/<route>  (if applicable)
```

---

## Step 10: Summary

```
✅ Epic development complete

Epic: $ARGUMENTS — <summary> (In Review)
Branch: <branch-name>
PR: <pr-url>
Preview: <deployment-url>
Version: <new-version>
Jira: https://jhsdc.atlassian.net/browse/$ARGUMENTS

Stories implemented (<count>):
  ✅ <KEY> — <summary> (In Review)
  ✅ <KEY> — <summary> (In Review)
  ...

Test pages:
  <deployment-url>/test/<component-slug>  (if any)

Skipped (<count> not in Dev Ready):
  ⏭  <KEY> — <summary> [<status>]
```

---

## Notes

- This command always works on the **main working directory** (no worktrees) because all stories share one branch and one PR.
- Stories must be in Dev Ready to be included. Stories in any other status are skipped and listed in the summary.
- Implement shared artifacts (types, utilities, base components) exactly once — don't duplicate work across stories.
- If the build fails mid-implementation, stop, leave the branch as-is for debugging, and do not create a PR or transition tickets.
- Always commit after each story so the git log maps 1:1 to Jira tickets.
- The Jira base URL: `https://jhsdc.atlassian.net/browse/`
- Jira project key: `VS`
- Vercel project name for deployments: `vercel-cert`
