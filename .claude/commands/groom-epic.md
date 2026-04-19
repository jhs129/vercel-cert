# Groom Epic

Fetch a Jira epic and all its child stories, display an overview, then run the /groom workflow on each child story in sequence — using the epic description as shared context so each story's acceptance criteria aligns with the epic goal.

The epic to groom: $ARGUMENTS

---

## Step 1: Fetch the Epic

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

If the issue is not found or is not an Epic, report the problem and stop.

Display the epic:
- **Epic:** $ARGUMENTS — <summary>
- **Status:** <status>
- **Description:** <full description>

---

## Step 2: Find Child Stories

Query for all child issues belonging to this epic:
```
searchJiraIssuesUsingJql(
  cloudId="...",
  jql="project = VS AND \"Epic Link\" = $ARGUMENTS ORDER BY created ASC",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter"]
)
```

If that returns no results, try the parent-based query (next-gen projects):
```
searchJiraIssuesUsingJql(
  cloudId="...",
  jql="project = VS AND parent = $ARGUMENTS ORDER BY created ASC",
  fields=["summary", "description", "issuetype", "status", "assignee", "reporter"]
)
```

If still no results, report "No child issues found for $ARGUMENTS" and stop.

Display the full story list before grooming anything:

```
📋 Epic: $ARGUMENTS — <summary>
<epic description, truncated to ~200 chars if long>

Child stories (<count> total):
  1. <KEY> — <summary> [<status>]
  2. <KEY> — <summary> [<status>]
  ...
```

---

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

---

## Step 4: Summary

After all stories are processed, display:

```
✅ Epic grooming complete

Epic: $ARGUMENTS — <summary>
Processed <N> stories:

[For each story:]
**<KEY>** — <summary>
- Status: → Requirements Review (or Blocked)
- Jira: https://jhsdc.atlassian.net/browse/<KEY>
```

---

## Notes

- The epic description is the source of truth for the feature's intent — use it to resolve ambiguity in individual stories
- Stories that are already in Requirements Review, Dev Ready, In Progress, In Review, or Done should be skipped (note them in the summary as "skipped — already past Grooming")
- The Jira base URL for this project is: `https://jhsdc.atlassian.net/browse/`
- Jira project key: `VS`
