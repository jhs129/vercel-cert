# Start Development on Dev Ready Tickets

Pick up tickets in Dev Ready status, implement them in parallel git worktrees, and create pull requests. Each worktree is removed after the PR is created to prevent accumulation.

The ticket(s) to develop: $ARGUMENTS

If $ARGUMENTS is empty, query all tickets with `status = "Dev Ready"`. If a ticket key is provided (e.g. `VS-8`), process only that ticket.

---

## Step 1: Resolve the Ticket List

Get the Atlassian cloud ID:
```
getAccessibleAtlassianResources()
```

If $ARGUMENTS is empty, query the Dev Ready queue:
```
searchJiraIssuesUsingJql(
  cloudId="...",
  jql="project = VS AND status = \"Dev Ready\" ORDER BY created ASC",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter"]
)
```

If $ARGUMENTS is a ticket key, fetch that single ticket:
```
getJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter"]
)
```

If no tickets are found, report "No tickets in Dev Ready" and stop.

Report the list of tickets found before proceeding.

---

## Step 2: Transition All Tickets to In Progress

For each ticket, immediately transition it to **In Progress** so the board reflects active work:

```
getTransitionsForJiraIssue(cloudId="...", issueIdOrKey="<ticket-key>")
transitionJiraIssue(cloudId="...", issueIdOrKey="<ticket-key>", transitionId="<in-progress-transition-id>")
```

Do this for all tickets before creating any worktrees.

---

## Step 3: Process Each Ticket

**Single ticket:** Perform Steps 4–9 directly in this session.

**Multiple tickets:** Invoke `superpowers:dispatching-parallel-agents`. Dispatch one subagent per ticket. Each subagent prompt must include:
- The specific ticket key
- The Atlassian cloud ID (from Step 1)
- The Vercel project name: `vercel-cert`
- The main repo root path (use `git rev-parse --show-toplevel` if needed)
- The complete instructions from Steps 4–9 of this document, verbatim

Wait for all subagents to complete, then display the Step 10 Summary with collated results.

---

## Step 4: Create a Git Worktree

From the main repo directory, create a dedicated worktree for this ticket:

```bash
# Ensure main is up to date
git fetch origin main

# Derive branch name from ticket key and summary slug
# e.g., VS-8 "CardImage Component" → vs-8-cardimage-component
BRANCH="<ticket-key-lowercase>-<slug>"

# Create worktree + branch
git worktree add ../<branch-name> -b <branch-name> origin/main
```

All subsequent work for this ticket happens inside `../<branch-name>/`.

---

## Step 5: Pull Vercel Development Environment Variables

Inside the worktree directory, pull the current development environment variables:

```bash
cd ../<branch-name>
vercel env pull .env.local --environment=development
```

This ensures the worktree build has all required env vars (e.g. `NEXT_PUBLIC_BUILDER_API_KEY`). If the Vercel CLI is not linked, run `vercel link` first.

---

## Step 6: Fetch Ticket Requirements

Fetch the full ticket to extract the refined requirements and acceptance criteria:

```
getJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields=["summary", "description", "issuetype", "status", "comment"]
)
```

Parse the description to extract:
- The user story
- The requirements list
- The acceptance criteria checklist

---

## Step 7: Implement the Solution

Inside the worktree, explore the codebase and implement the work:

- Read relevant files before editing
- Follow CLAUDE.md conventions (Tailwind tokens, server/client split, Builder.io patterns)
- Make only the changes needed to satisfy the acceptance criteria — no scope creep
- Use `pnpm` as the package manager

**If this ticket introduces or modifies a UI component** (i.e., creates files under `components/ui/`), also create a test page at `app/test/<component-slug>/page.tsx` that:
- Imports the component directly (no Builder.io)
- Renders multiple prop variants: default, with all slots filled, with theme variants, and (for card-type components) a multi-card row to verify equal-height alignment
- Uses a simple `<main className="p-8 space-y-8">` wrapper with no layout chrome

The test page will be accessible at `<vercel-preview-url>/test/<component-slug>` after the branch deployment is ready, and will be linked in the PR and Jira ticket by the create-pr workflow.

After implementing, run the build:
```bash
pnpm install
pnpm build
```

Fix any build or lint errors before proceeding. Do not create a PR if the build fails.

---

## Step 8: Create the Pull Request

From inside the worktree, run the pull-request workflow:

- The branch name already follows the Jira ticket naming convention, so the workflow auto-detects the ticket key
- The workflow will: verify the build, create the test page (if a UI component), bump the version, push the branch, create the PR, detect the Vercel preview deployment URL, and post the PR + deployment + test page links to the Jira ticket

Follow all steps in `.claude/commands/pr.md`.

---

## Step 9: Clean Up the Worktree

After the PR is created successfully, remove the local worktree (the branch and PR remain intact on the remote):

```bash
# From the main repo root
cd <main-repo-root>
git worktree remove ../<branch-name> --force
```

Confirm the worktree was removed:
```bash
git worktree list
```

---

## Step 10: Summary

After all tickets are processed, display:

```
✅ Development complete

Processed X ticket(s):

[For each ticket:]
**<TICKET-KEY>** — <Summary>
- Branch: <branch-name> (pushed to remote)
- PR: <pr-url>
- Preview: <vercel-deployment-url>
- Test page: <vercel-deployment-url>/test/<component-slug>  (if applicable)
- Jira: https://jhsdc.atlassian.net/browse/<TICKET-KEY> (In Review)
- Worktree: removed ✓
```

---

## Notes

- Always remove the worktree after PR creation — never leave local worktrees around
- If the build fails, stop and report the errors without creating a PR or removing the worktree (leave it for debugging)
- Branch naming: `<ticket-key-lowercase>-<short-slug>` — e.g., `vs-8-cardimage-component`
- The Jira base URL for this project is: `https://jhsdc.atlassian.net/browse/`
- Jira project key: `VS`
- Main repo root: use `git rev-parse --show-toplevel` if needed
