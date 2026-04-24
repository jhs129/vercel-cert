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
