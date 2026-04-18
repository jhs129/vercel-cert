# Create Pull Request

Create a pull request for the current branch. If the branch name follows the Jira ticket naming convention used by `/fix-jira` (e.g. `vs-10-core-semantic-styles`), fetch the Jira ticket and include a link and summary in the PR description.

---

## Step 1: Read the Current Branch and Git State

Run these in parallel:
```bash
git branch --show-current
git status
git log --oneline main..HEAD
git diff main...HEAD --stat
```

From the branch name, check whether it matches the Jira ticket pattern: `^([a-zA-Z]+-\d+)(-.*)?$`

Examples that match:
- `vs-10-core-semantic-styles` → ticket key `VS-10`
- `vs-3` → ticket key `VS-3`
- `feature/vs-5-auth` → ticket key `VS-5`

If no match, skip Jira steps entirely.

---

## Step 2: Fetch the Jira Ticket (if applicable)

If a ticket key was found:

```
getAccessibleAtlassianResources()
```

Then:
```
getJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields=["summary", "description", "issuetype", "status", "priority"]
)
```

Extract the summary and acceptance criteria from the description to use in the PR body.

---

## Step 3: Verify the Build is Clean

```bash
pnpm build
```

If the build fails, stop and tell the user to fix the errors before creating the PR. Do not proceed.

---

## Step 4: Determine the Next PR Number and Update the Version

Get the highest existing PR number to predict the next one:
```bash
gh pr list --state all --limit 1 --json number --jq '.[0].number'
```

The next PR number will be that value + 1. If no PRs exist yet, use 1.

Update `package.json` to set the version patch segment to the PR number:
- Current version `0.1.0` + PR #12 → `0.1.12`
- Current version `0.1.8` + PR #12 → `0.1.12`
- Pattern: keep `MAJOR.MINOR.` prefix, replace patch with the PR number

Read `package.json`, update the `version` field, write it back.

Then commit the version bump:
```bash
git add package.json
git commit -m "chore: bump version for PR #<number>"
```

---

## Step 5: Push the Branch

```bash
git push -u origin <branch-name>
```

---

## Step 6: Build the PR Title and Body

**Title:** Use the Jira ticket summary if available, otherwise derive a concise title (under 70 chars) from the branch slug and git log.

**Body:** Write in first person as if John Schneider wrote it — friendly, direct, like a real developer explaining their work to a teammate. Do not make it sound like it was generated.

Structure:
```
## Summary
<1-3 bullet points describing what changed and why>

<If Jira ticket found:>
**Jira:** [<TICKET-KEY>: <ticket summary>](https://jhsdc.atlassian.net/browse/<TICKET-KEY>)

## Changes
<bullet list of files or areas changed with brief descriptions>

## Test Plan
- [ ] Build passes (`pnpm build`)
- [ ] <specific thing to verify based on the changes>
- [ ] <another verification step>

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
```

---

## Step 7: Create the PR

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

Use `--base main` if the base branch is not automatically detected correctly.

---

## Step 8: Transition the Jira Ticket (if applicable)

If a Jira ticket was found, transition it to "In Review" or the equivalent status:

```
getTransitionsForJiraIssue(cloudId="...", issueIdOrKey="<ticket-key>")
```

Pick the transition that represents "In Review", "In Progress", or "Under Review" — whichever is most appropriate. Then:

```
transitionJiraIssue(cloudId="...", issueIdOrKey="<ticket-key>", transitionId="...")
```

---

## Step 9: Show the Result

```
✅ Pull request created

**PR:** <title> — <pr-url>
**Branch:** <branch-name>
**Version:** <new-version>
<If Jira:>
**Jira:** https://jhsdc.atlassian.net/browse/<ticket-key> (transitioned to In Review)
```

---

## Notes

- If there are uncommitted changes, warn the user and ask if they want to commit them first before proceeding. Do not silently stash or discard anything.
- If the branch is already pushed and has an open PR, show the existing PR URL and stop.
- Always look at ALL commits on the branch (not just the latest) when writing the PR description.
- The Jira base URL for this project is: `https://jhsdc.atlassian.net/browse/`
