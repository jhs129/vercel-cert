# Fix Jira Item

You are helping refine, clarify, and implement a Jira ticket from the project at https://jhsdc.atlassian.net/browse/

The ticket to work on is: $ARGUMENTS

---

## Step 1: Fetch the Jira Ticket

First, get the Atlassian cloud ID:
```
getAccessibleAtlassianResources()
```

Then fetch the ticket (strip the base URL if provided — extract just the key like PROJ-123):
```
getJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields=["summary", "description", "issuetype", "status", "priority", "assignee", "reporter", "labels", "components", "customfield_10016"]
)
```

Display the current ticket contents clearly:
- **Summary:** ...
- **Type:** ...
- **Status:** ...
- **Description:** (full text)
- **Current Acceptance Criteria:** (if present)

---

## Step 2: Analyze the Ticket

Read the ticket carefully and identify:
1. Are requirements clear and actionable?
2. Is there missing context (who, what, why, edge cases)?
3. Are acceptance criteria present and testable?
4. What clarifying questions would help make this ticket implementation-ready?

---

## Step 3: Ask Clarifying Questions

Present a numbered list of clarifying questions based on what's missing or ambiguous. Reference actual content from the ticket. For example:

- "The description mentions X but doesn't specify Y — can you clarify?"
- "Should this work for logged-out users as well, or only authenticated users?"
- "What should happen if Z fails?"
- "Is there a design or mockup for this feature?"

Wait for the user to respond before proceeding.

---

## Step 4: Confirm the Updated Requirements

Based on the user's answers, draft updated content and present it to the user for review before saving:

**Proposed Updated Description:**
[Rewrite the description with full context, user story format if applicable, and technical notes]

**Proposed Acceptance Criteria:**
```
- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]
- [ ] Edge case: [description of edge case behavior]
- [ ] Error state: [what happens when X fails]
```

Ask: "Does this look correct? Should I update the Jira ticket and begin implementation?"

---

## Step 5: Create a Feature Branch

**Before updating the ticket or touching any code**, create a local branch from main:

```bash
git checkout main
git pull origin main
git checkout -b <ticket-key-lowercase>
```

For example, if the ticket is `VS-3`, create branch `vs-3`. If the ticket summary is descriptive, append a short slug: `vs-3-gtm-support`.

Confirm the branch was created and show the current branch name. **All subsequent work happens on this branch.**

---

## Step 6: Update the Jira Ticket

Once on the branch, update the ticket using Atlassian Document Format (ADF). Structure the description as:
1. Refined requirements section
2. "Acceptance Criteria" heading followed by a bullet checklist

```
editJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields={
    "description": {
      "type": "doc",
      "version": 1,
      "content": [...]
    }
  }
)
```

---

## Step 7: Implement the Fix or Feature

Explore the codebase to understand what needs to change, then implement the work according to the finalized acceptance criteria.

Follow these rules:
- Read relevant files before editing them
- Make only the changes needed to satisfy the acceptance criteria — no scope creep
- Follow existing code patterns and conventions (see CLAUDE.md)
- Use pnpm as the package manager if dependencies are needed
- Do NOT commit any changes — leave everything as unstaged working tree changes for the user to review

After implementing, run the build to verify no errors:
```bash
pnpm build
```

Fix any build or lint errors before finishing.

---

## Step 8: Summary (changes are NOT committed)

Display a final summary:

```
✅ Jira ticket updated and implementation complete

**Ticket:** <ticket-key> — https://jhsdc.atlassian.net/browse/<ticket-key>
**Branch:** <branch-name>

**Changes made:**
- [file or area changed]: [brief description]
- [file or area changed]: [brief description]

**Acceptance Criteria Status:**
- [ ] [criterion 1]
- [ ] [criterion 2]

All changes are unstaged. Review with `git diff` then commit when ready.
```

---

## Notes

- If $ARGUMENTS is empty, ask for the ticket ID before proceeding
- If the ticket already has clear acceptance criteria, skip straight to confirming them before implementation
- If main is not the default branch, use whatever the repo's default branch is (`git symbolic-ref refs/remotes/origin/HEAD`)
- Do not commit, push, or create a PR — leave that to the user
