# PR Feedback Handler

Address pull request review comments. Accepts an optional PR number argument (e.g. `/pr-feedback 42`) — when given, checks out that PR's branch in a git worktree and works there. Without an argument, operates on the current branch's open PR.

Your goal is to read every reviewer comment on the PR and make the appropriate code changes to satisfy the feedback. Work systematically and completely — don't skip comments or make partial fixes.

## Step 1: Identify the PR and set up working directory

**If a PR number was provided as an argument** (e.g. `/pr-feedback 42`):

1. Fetch the PR's branch name:
   ```bash
   gh pr view <number> --json headRefName,baseRefName,title,url --jq '{branch: .headRefName, base: .baseRefName, title: .title, url: .url}'
   ```
2. Create a worktree for that branch (so you don't disturb the user's current work):
   ```bash
   git fetch origin <branch>
   git worktree add ../<branch> origin/<branch>
   ```
3. All file reads and edits must happen inside the worktree path (`../<branch>/`). Run build/lint commands from that directory too.
4. When done, **remove the worktree** (do NOT delete the branch):
   ```bash
   git worktree remove ../<branch>
   ```

**If no PR number was provided**, run in the current directory:
```bash
gh pr view --json number,title,url,headRefName,baseRefName
```
If there's no open PR for the current branch, tell the user and stop.

## Step 2: Check for and resolve merge conflicts

Check whether the PR branch has conflicts with its base:
```bash
gh pr view <number> --json mergeable,mergeStateStatus --jq '{mergeable: .mergeable, state: .mergeStateStatus}'
```

If `mergeable` is `CONFLICTING`:

1. Make sure you're working in the right directory (worktree if a PR number was given, otherwise the repo root).
2. Fetch and merge the base branch:
   ```bash
   git fetch origin
   git merge origin/<baseRefName>
   ```
3. Git will report which files have conflicts. For each conflicted file, read the file and look for `<<<<<<<`, `=======`, `>>>>>>>` markers. Resolve each conflict by choosing the correct code — don't blindly pick one side; understand what both sides changed and produce the right merged result.
4. After resolving all conflicts:
   ```bash
   git add <resolved-files>
   git merge --continue
   ```
5. Run the build immediately to confirm the merge didn't break anything:
   ```bash
   pnpm build
   ```

If `mergeable` is `MERGEABLE` or `UNKNOWN`, skip this step and proceed.

## Step 3: Fetch all comments

Run these in parallel to get both comment types:

**General PR comments** (top-level conversation):
```bash
gh pr view <number> --json comments --jq '.comments[] | {author: .author.login, body: .body}'
```

**Inline review comments** (line-specific, the kind shown in the diff):
```bash
gh api repos/$(gh repo view --json nameWithOwner --jq '.nameWithOwner')/pulls/<number>/comments \
  --jq '.[] | {path: .path, line: .line, originalLine: .original_line, body: .body, author: .user.login, diffHunk: .diff_hunk}'
```

**Review-level comments** (summary comments left with a review submission):
```bash
gh api repos/$(gh repo view --json nameWithOwner --jq '.nameWithOwner')/pulls/<number>/reviews \
  --jq '.[] | select(.body != "") | {author: .user.login, body: .body, state: .state}'
```

## Step 4: Analyze comments

Categorize each comment:

- **Actionable change**: Reviewer clearly asks for a code change → implement it
- **Question**: Reviewer asks "why?" or "what does this do?" → usually no code change, but consider if clarity could be improved
- **Praise**: "Nice", "LGTM", etc. → skip
- **Discussion**: Back-and-forth that's already resolved → skip

For inline comments, use the `diffHunk` to understand exactly which code the reviewer is looking at and what they're reacting to.

## Step 5: Implement the changes

Work through each actionable comment. Read the full file context before making changes — don't edit blindly based on the diff hunk alone.

### Common feedback patterns and how to handle them

**"Move this to a shared library / utility"**
- Create or update the appropriate file (`lib/`, `utils/`, etc.)
- Export the extracted function
- Update every call site — not just the one the reviewer flagged

**"This should be reusable / other routes might need this"**
- Identify the reusable concern (URL building, data fetching, etc.)
- Extract into a named function in the right shared location
- Update all current usages
- Make sure the new export is clean and well-named

**"Naming should be clearer"**
- Rename across all usages in the codebase, not just the flagged line

**"This is inconsistent with how we do X elsewhere"**
- Find the established pattern in the codebase
- Align the flagged code with that pattern

**"Split this component / this file is too large"**
- Follow the project's component splitting convention (see CLAUDE.md)

## Step 6: Build and lint

After making all changes, run from the working directory (worktree path if a PR number was given, otherwise current directory):
```bash
pnpm build && pnpm lint
```

Fix any errors before proceeding. If the build was already broken before your changes, note that separately.

## Step 7: Report back

Summarize what you did in a compact list:

- For each comment addressed: what the feedback was and what you changed
- For any comment you skipped: why (e.g., "praise", "already addressed", "needs human decision")
- Any follow-up questions or things that need the user's input before they can be resolved

Do NOT push, commit, or create a new PR unless the user explicitly asks.
