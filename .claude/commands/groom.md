# Groom Jira Tickets

Refine requirements for tickets in Grooming status. Posts structured comments to Jira with assumptions, questions, and proposed acceptance criteria — then updates the ticket and transitions it to Requirements Review.

The ticket(s) to groom: $ARGUMENTS

If $ARGUMENTS is empty, query all tickets with `status = Grooming`. If a ticket key is provided (e.g. `VS-8`), process only that ticket.

---

## Step 1: Resolve the Ticket List

Get the Atlassian cloud ID:
```
getAccessibleAtlassianResources()
```

If $ARGUMENTS is empty, query the Grooming queue:
```
searchJiraIssuesUsingJql(
  cloudId="...",
  jql="project = VS AND status = Grooming ORDER BY created ASC",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter", "labels", "components"]
)
```

If $ARGUMENTS is a ticket key, fetch that single ticket:
```
getJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter", "labels", "components"]
)
```

If no tickets are found, report "No tickets in Grooming" and stop.

---

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

---

## Step 3: Fetch Ticket Details and Comment History

Fetch the full ticket and all existing comments:
```
getJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter", "comment"]
)
```

Display the current ticket:
- **Summary:** ...
- **Description:** (full text)
- **Existing Comments:** (count and any prior grooming comments)

**Detect re-groom:** If comments from a prior grooming session exist (look for comments that contain "Grooming Agent" or "Assumptions Made" or "Acceptance Criteria"), this is a requirements review rejection. Read those prior comments AND any subsequent human comments carefully — you must address the specific feedback rather than starting fresh.

---

## Step 4: Analyze the Ticket

Based on the description and any prior comment feedback:

1. Are requirements clear and actionable?
2. Is there missing context (who, what, why, edge cases)?
3. Are acceptance criteria present and testable?
4. What assumptions can be reasonably made vs. what truly needs human input?
5. If re-groom: what specific feedback was given? Have prior questions been answered in the comments?

**If the ticket is too vague to make any reasonable assumptions** (e.g., completely empty description, single word summary with no context): skip to Step 7 and transition to BLOCKED instead.

---

## Step 5: Draft the Grooming Comment

Compose a structured Jira comment (plain text, no ADF needed for comments). Format:

```
🤖 Grooming Agent — Requirements Refinement

[If re-groom, start with:]
📋 Addressing Prior Feedback
[Summarize what feedback was given and how this revision addresses it]

---

📌 Assumptions Made
[List every decision made without explicit guidance. Be specific so these can be overridden.]
- Assumed X because Y
- Defaulted to Z since no alternative was specified

---

❓ Clarifying Questions (Non-Blocking)
[Things that would improve the implementation but won't block it. Answer these before dev starts if possible.]
1. [Question about edge case or design decision]
2. [Question about scope or behavior]

---

✅ Proposed Acceptance Criteria
These will be written to the ticket description. Review them before approving this ticket for development.
- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]
- [ ] Edge case: [description]
- [ ] Error state: [what happens when X fails]
```

Post this as a comment:
```
addCommentToJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  body="<comment text>"
)
```

---

## Step 6: Update the Ticket Description

Rewrite the ticket description using Atlassian Document Format (ADF) with this structure:
1. **User Story** — As a [user], I want [feature] so that [benefit]
2. **Requirements** — Refined, actionable requirements derived from the original description and assumptions
3. **Acceptance Criteria** — The same checklist posted in the comment, formatted as a bullet list

```
editJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields={
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        // User Story heading + paragraph
        // Requirements heading + bullet list
        // Acceptance Criteria heading + task list
      ]
    }
  }
)
```

---

## Step 7: Reassign and Transition

Re-assign the ticket to the reporter:
```
editJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields={
    "assignee": { "accountId": "<reporter-account-id>" }
  }
)
```

Get available transitions:
```
getTransitionsForJiraIssue(cloudId="...", issueIdOrKey="<ticket-key>")
```

- If the ticket has enough context to proceed: transition to **Requirements Review**
- If the ticket is too vague (no description, no context): transition to **Blocked** and post a comment explaining what's needed before grooming can proceed

```
transitionJiraIssue(cloudId="...", issueIdOrKey="<ticket-key>", transitionId="...")
```

---

## Step 8: Summary

After processing all tickets, display:

```
✅ Grooming complete

Processed X ticket(s):

[For each ticket:]
**<TICKET-KEY>** — <Summary>
- Status: → Requirements Review (or Blocked)
- Assumptions: <count> documented in comment
- Questions: <count> left for review
- AC: <count> criteria written
- Jira: https://jhsdc.atlassian.net/browse/<TICKET-KEY>
```

---

## Notes

- Never ask clarifying questions interactively — all questions go into the Jira comment
- Make reasonable assumptions rather than blocking; document every assumption
- If multiple tickets are being processed, note progress as you go (e.g. "Processing VS-8 (1 of 3)...")
- The Jira base URL for this project is: `https://jhsdc.atlassian.net/browse/`
- Jira project key: `VS`
