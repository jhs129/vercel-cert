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

## Step 4: Create the Test Page (if applicable)

Check whether this branch introduces or modifies any component under `components/ui/`:

```bash
git diff main...HEAD --name-only | grep "^components/ui/"
```

If UI components are modified:
- Derive the component name from the directory (e.g., `components/ui/CardImage/` → `card-image`)
- Create a test page at `app/test/<component-slug>/page.tsx` that:
  - Imports the component
  - Renders it with a representative set of prop combinations (e.g., default, with all slots filled, with theme variants, in a multi-card row if applicable)
  - Uses a simple `<main>` wrapper with padding — no layout chrome needed
  - Does NOT import from Builder.io — this is a pure component render test

Example structure for `app/test/card-image/page.tsx`:
```tsx
import { CardImage } from "@/components/ui/CardImage";

export default function CardImageTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">CardImage — Test Page</h1>
      {/* Default */}
      <CardImage
        image="https://placehold.co/600x338.png"
        alt="Placeholder image"
        headline="Default card headline"
        body="Default body text for the card component."
      />
      {/* With CTA */}
      {/* Additional variants... */}
    </main>
  );
}
```

Commit the test page along with any other uncommitted changes:
```bash
git add app/test/
git commit -m "chore: add test page for <component-name>"
```

The test page will be available at `<vercel-preview-url>/test/<component-slug>` after the deployment is ready.

---

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

   **Stop.** Do not push or create a PR.

---

## Step 6: Determine the Next PR Number and Update the Version

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

## Step 7: Push the Branch

```bash
git push -u origin <branch-name>
```

---

## Step 8: Detect the Vercel Preview Deployment

After pushing, Vercel automatically triggers a preview deployment. Poll for it using the Vercel MCP:

```
list_deployments(
  projectId="vercel-cert",   // use the Vercel project name or ID
  target="preview",
  gitBranch="<branch-name>",
  limit=1
)
```

If the deployment is not yet in "READY" state, wait up to 3 minutes and retry every 30 seconds:
```
get_deployment(deploymentId="<id>")
```

Once ready, record the primary deployment URL (the git-branch-specific URL, e.g. `vercel-cert-git-<branch-slug>-<team>.vercel.app`).

If detection times out or fails, note the failure in the PR and Jira comment but do not block PR creation.

**Test page URL** (if applicable): `<deployment-url>/test/<component-slug>`

---

## Step 9: Build the PR Title and Body

**Title:** Use the Jira ticket summary if available, otherwise derive a concise title (under 70 chars) from the branch slug and git log.

**Body:** Write in first person as if John Schneider wrote it — friendly, direct, like a real developer explaining their work to a teammate. Do not make it sound like it was generated.

Structure:
```
## Summary
<1-3 bullet points describing what changed and why>

<If Jira ticket found:>
**Jira:** [<TICKET-KEY>: <ticket summary>](https://jhsdc.atlassian.net/browse/<TICKET-KEY>)

<If Vercel deployment detected:>
**Preview:** <deployment-url>

## Changes
<bullet list of files or areas changed with brief descriptions>

## Test Plan
- [ ] Build passes (`pnpm build`)
- [ ] <specific functional check based on the changes>
<If component with test page:>
- [ ] Visit `<deployment-url>/test/<component-slug>` — verify all variants render correctly
- [ ] Verify equal-height card alignment in the multi-card row story (Storybook)
- [ ] Verify accessibility: run Storybook a11y addon on the component story
- [ ] <additional verification steps derived from the AC in the Jira ticket>

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
```

---

## Step 10: Create the PR

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

Use `--base main` if the base branch is not automatically detected correctly.

---

## Step 11: Update the Jira Ticket (if applicable)

If a Jira ticket was found:

**a) Transition to "In Review":**
```
getTransitionsForJiraIssue(cloudId="...", issueIdOrKey="<ticket-key>")
```
Pick the transition that represents "In Review", then:
```
transitionJiraIssue(cloudId="...", issueIdOrKey="<ticket-key>", transitionId="...")
```

**b) Assign the ticket to the reporter** (use the reporter's accountId from the ticket fetched in Step 2):
```
editJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields={ "assignee": { "accountId": "<reporter-account-id>" } }
)
```

**c) Add a comment with the PR link, Vercel preview URL, and test page link** using ADF with real hyperlinks:
```
addCommentToJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  contentFormat="adf",
  commentBody={
    "type": "doc",
    "version": 1,
    "content": [
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "PR ready for review: " },
          {
            "type": "text",
            "text": "<pr-url>",
            "marks": [{ "type": "link", "attrs": { "href": "<pr-url>" } }]
          }
        ]
      },
      // If Vercel deployment detected:
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Preview deployment: " },
          {
            "type": "text",
            "text": "<deployment-url>",
            "marks": [{ "type": "link", "attrs": { "href": "https://<deployment-url>" } }]
          }
        ]
      },
      // If test page exists:
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Component test page: " },
          {
            "type": "text",
            "text": "<deployment-url>/test/<component-slug>",
            "marks": [{ "type": "link", "attrs": { "href": "https://<deployment-url>/test/<component-slug>" } }]
          }
        ]
      }
    ]
  }
)
```

---

## Step 12: Show the Result

```
✅ Pull request created

**PR:** <title> — <pr-url>
**Branch:** <branch-name>
**Version:** <new-version>
**Preview:** <deployment-url>
<If test page:>
**Test page:** <deployment-url>/test/<component-slug>
<If Jira:>
**Jira:** https://jhsdc.atlassian.net/browse/<ticket-key> (In Review, PR + deployment links added)
```

---

## Notes

- If there are uncommitted changes, warn the user and ask if they want to commit them first before proceeding. Do not silently stash or discard anything.
- If the branch is already pushed and has an open PR, show the existing PR URL and stop.
- Always look at ALL commits on the branch (not just the latest) when writing the PR description.
- Test pages live under `app/test/` and are only for manual QA — they do not need to be removed after merge (they are low-cost and may be useful for regression testing).
- The Vercel project name for `list_deployments` is `vercel-cert`. Use `list_teams` or `list_projects` first if the project ID is needed.
- The Jira base URL for this project is: `https://jhsdc.atlassian.net/browse/`
