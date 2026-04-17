# Fix Jira Item

You are helping refine and update a Jira ticket with clear requirements and acceptance criteria.

The Jira project base URL is: https://jhsdc.atlassian.net/browse/
The ticket to work on is: $ARGUMENTS

## Step 1: Fetch the Jira Ticket

First, get the Atlassian cloud ID:
```
getAccessibleAtlassianResources()
```

Then fetch the ticket using the ticket ID from $ARGUMENTS (strip the URL if a full URL was provided — extract just the ticket key like PROJ-123):
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
1. What is the current description saying?
2. Are requirements clear and actionable?
3. Is there missing context (who, what, why, edge cases)?
4. Are acceptance criteria present and testable?
5. What clarifying questions would help make this ticket implementation-ready?

---

## Step 3: Ask Clarifying Questions

Present a numbered list of clarifying questions based on what's missing or ambiguous. Be specific — reference actual content from the ticket. For example:

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
Use a clear checklist format:
```
**Acceptance Criteria:**

- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]
- [ ] Edge case: [description of edge case behavior]
- [ ] Error state: [what happens when X fails]
```

Ask: "Does this look correct? Should I update the Jira ticket now?"

---

## Step 5: Update the Jira Ticket

Once the user confirms, update the ticket:

```
editJiraIssue(
  cloudId="...",
  issueIdOrKey="<ticket-key>",
  fields={
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "<updated description with acceptance criteria>" }]
        }
      ]
    }
  }
)
```

Format the description as Atlassian Document Format (ADF). Structure it as:
1. A description section with the refined requirements
2. A clear "Acceptance Criteria" heading followed by a bullet list of testable criteria

---

## Step 6: Confirm Completion

After updating, display:
```
✅ Ticket updated: <ticket-key>
https://jhsdc.atlassian.net/browse/<ticket-key>

**What was updated:**
- Clarified description with [brief summary of changes]
- Added [N] acceptance criteria

**Acceptance Criteria Added:**
- [list the criteria]
```

---

## Notes

- If the ticket already has good acceptance criteria, focus clarifying questions on gaps or edge cases only
- If $ARGUMENTS is empty, ask the user for the ticket ID before proceeding
- The Jira project base is https://jhsdc.atlassian.net/browse/ — always construct links using this base
- Use ADF (Atlassian Document Format) when writing description content to the API
