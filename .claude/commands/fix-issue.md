# Fix Jira Item

Review a Jira issue and fix it. Behavior depends on the issue type and status:

- **Bug** → create a standalone branch from main, implement the fix, create a PR
- **Story/Task in "In Review"** → check out the existing story branch, find all open linked bugs and subtasks, fix them on that branch, push to update the open PR

The issue to fix: $ARGUMENTS

If $ARGUMENTS is empty, ask for the issue key before proceeding.

---

## Step 1: Fetch the Issue

Get the Atlassian cloud ID:
```
getAccessibleAtlassianResources()
```

Fetch the issue with full fields:
```
getJiraIssue(
  cloudId="...",
  issueIdOrKey="<issue-key>",
  fields=["summary", "description", "issuetype", "status", "priority", "assignee",
          "reporter", "subtasks", "issuelinks", "comment"]
)
```

Determine the **flow** based on issue type and status:

| Condition | Flow |
|-----------|------|
| Issue type is **Bug** | → [Bug Flow](#bug-flow-steps-2b9b) |
| Issue type is **Story** or **Task** AND status is **In Review** | → [Story Flow](#story-flow-steps-2s9s) |
| Issue type is Story/Task but status is NOT In Review | Stop and tell the user: "VS-X is in [status], not In Review. Run /start-dev to implement it first, or move it to In Review before using /fix-jira for feedback fixes." |

---

## Bug Flow (Steps 2B–9B)

### Step 2B: Understand the Bug

Read the description and any comments to understand:
- What is broken
- Steps to reproduce (if provided)
- Expected vs. actual behavior
- Any linked story for context

If linked to a parent story, fetch that story's description too for full context.

### Step 3B: Create a Standalone Branch

```bash
git fetch origin main

# Branch name: <bug-key-lowercase>-<short-slug>
# e.g., VS-20 "Button hover color wrong" → vs-20-button-hover-color
git checkout -b vs-<number>-<slug> origin/main
```

Transition the bug to **In Progress**:
```
getTransitionsForJiraIssue(cloudId="...", issueIdOrKey="<bug-key>")
transitionJiraIssue(cloudId="...", issueIdOrKey="<bug-key>", transitionId="<in-progress-id>")
```

### Step 4B: Implement the Fix

Explore the codebase and fix the bug:
- Read relevant files before editing
- Make only the changes needed to fix this specific bug — no scope creep
- Follow CLAUDE.md conventions (Tailwind tokens, server/client split, Builder.io patterns)
- Use `pnpm` as the package manager

After implementing:
```bash
pnpm build
```
Fix any build or lint errors. Do not proceed if the build fails.

### Step 5B: Create the Pull Request

Follow all steps in `.claude/commands/pr.md`.

The workflow will:
- Detect Vercel preview deployment
- Create a test page if a UI component was modified
- Bump the version and push
- Create the PR
- Post links to the Jira bug ticket and transition it to In Review

### Step 6B: Summary

```
✅ Bug fix complete

**Bug:** <bug-key> — <summary>
- Branch: <branch-name>
- PR: <pr-url>
- Preview: <vercel-deployment-url>
- Jira: https://jhsdc.atlassian.net/browse/<bug-key> (In Review)
```

---

## Story Flow (Steps 2S–9S)

This flow handles a story that is already In Review (PR open from `/start-dev`). The user has tested the PR, identified issues, and logged them as linked bugs or subtasks. This flow checks out the existing branch and fixes all open linked issues in place.

### Step 2S: Find Open Linked Issues

From the fetched story, collect all open issues to fix:

**Subtasks** — from `fields.subtasks`:
```
For each subtask where status != "Done":
  getJiraIssue(cloudId="...", issueIdOrKey="<subtask-key>", fields=["summary", "description", "status", "issuetype"])
```

**Linked bugs** — from `fields.issuelinks`:
```
For each issuelink where the linked issue type is "Bug" AND the linked issue status != "Done":
  getJiraIssue(cloudId="...", issueIdOrKey="<linked-key>", fields=["summary", "description", "status", "issuetype"])
```

If no open subtasks or linked bugs are found, report: "No open linked issues found for VS-X. Nothing to fix." and stop.

Display the list of issues to be fixed before proceeding.

### Step 3S: Find and Check Out the Existing Story Branch

Derive the branch name from the story key and summary (same convention used by `/start-dev`):
```bash
# Pattern: vs-<number>-<summary-slug>
# e.g., VS-9 "Button Component" → vs-9-button-component
BRANCH="vs-<number>-<slug>"
```

Verify the branch exists on the remote and check it out:
```bash
git fetch origin
git checkout <branch-name>
git pull origin <branch-name>
```

If the branch is not found, try looking up the open PR for the story:
```bash
gh pr list --state open --json number,headRefName,url \
  --jq ".[] | select(.headRefName | test(\"vs-<number>\"))"
```

Use the `headRefName` from the PR as the branch name. If still not found, stop and ask the user to confirm the branch name.

### Step 4S: Fix Each Linked Issue

For each open linked issue (subtasks first, then linked bugs), in sequence:

1. **Read the issue** to understand what needs to be fixed
2. **Transition to In Progress**:
   ```
   transitionJiraIssue(cloudId="...", issueIdOrKey="<issue-key>", transitionId="<in-progress-id>")
   ```
3. **Implement the fix** in the worktree — make only the changes needed for this specific issue
4. **Commit the fix** with a descriptive message referencing the issue key:
   ```bash
   git add <changed-files>
   git commit -m "fix: <brief description> (<issue-key>)"
   ```
5. **Transition the issue to Done**:
   ```
   transitionJiraIssue(cloudId="...", issueIdOrKey="<issue-key>", transitionId="<done-id>")
   ```
6. **Add a comment** to the linked issue noting it was fixed:
   ```
   addCommentToJiraIssue(
     cloudId="...",
     issueIdOrKey="<issue-key>",
     contentFormat="markdown",
     commentBody="Fixed in branch `<branch-name>` as part of VS-<story-number> PR feedback."
   )
   ```

After all issues are fixed, run the build to verify everything works together:
```bash
pnpm build
```
Fix any build or lint errors before proceeding.

### Step 5S: Push the Branch

```bash
git push origin <branch-name>
```

This automatically updates the already-open PR — no new PR creation needed.

### Step 6S: Detect Updated Vercel Deployment

After pushing, poll for the updated Vercel preview deployment:
```
list_deployments(projectId="vercel-cert", target="preview", gitBranch="<branch-name>", limit=1)
```
Poll `get_deployment` until READY (up to 3 min). Record the updated deployment URL.

### Step 7S: Update the Story's Jira Ticket

Add a comment to the **story** ticket summarizing what was fixed:
```
addCommentToJiraIssue(
  cloudId="...",
  issueIdOrKey="<story-key>",
  contentFormat="adf",
  commentBody={
    "type": "doc", "version": 1,
    "content": [
      { "type": "paragraph", "content": [{ "type": "text", "text": "PR feedback fixes applied:" }] },
      {
        "type": "bulletList",
        "content": [
          // One listItem per fixed issue: "<issue-key>: <summary> — fixed"
        ]
      },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Updated preview: " },
          { "type": "text", "text": "<deployment-url>", "marks": [{ "type": "link", "attrs": { "href": "https://<deployment-url>" } }] }
        ]
      }
    ]
  }
)
```

### Step 8S: Summary

```
✅ Story feedback fixes complete

**Story:** <story-key> — <summary>
- Branch: <branch-name> (pushed — existing PR updated)
- PR: <existing-pr-url>
- Preview: <updated-deployment-url>
- Jira: https://jhsdc.atlassian.net/browse/<story-key>

Fixed issues:
- <issue-key>: <summary> → Done
- <issue-key>: <summary> → Done
```

---

## Notes

- **Bug flow** creates a new branch and new PR — it is independent of any story branch
- **Story flow** works on the existing branch in-place; the open PR is updated automatically on push
- For the story flow, only fix issues that are explicitly linked to the story (subtasks or issue links) — do not scan for issues by keyword or heuristic
- If a linked issue has no description, add a Jira comment asking for clarification and skip that issue rather than guessing
- Always run `pnpm build` after all fixes and before pushing
- Jira project key: `VS` | Cloud ID: `c546b8b8-c5e9-4677-8322-7a935c3d3860`
- Jira base URL: `https://jhsdc.atlassian.net/browse/`
- Use `pnpm`, not npm or yarn
