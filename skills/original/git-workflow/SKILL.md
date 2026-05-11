---
name: git-workflow
description: Standardize Git usage across the team. Use when committing code, writing commit messages, creating branches, opening PRs, or managing releases. Triggers on: git, commit, branch, merge, rebase, pull-request, stash.
---

# Git Workflow

Standardized Git practices for teams. Opinionated. Specific.

## Branch Naming

Format: `<type>/<ticket-id>-<short-description>`

```
type: feature | fix | chore | refactor | docs | test | hotfix
```

**Examples:**
```
feature/ABC-123-user-authentication
fix/ABC-456-login-redirect-loop
chore/ABC-789-upgrade-node-version
refactor/ABC-321-extract-payment-service
docs/ABC-654-api-documentation
hotfix/ABC-789-critical-security-patch
```

**Rules:**
- Use kebab-case (lowercase, hyphens)
- Keep it short: max 50 characters
- Include ticket ID for traceability
- Never use `main`, `master`, `develop` directly — these are protected

## Commit Messages

**Follow Conventional Commits:**

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `style` — formatting, no code change
- `refactor` — code change that neither fixes a bug nor adds feature
- `test` — adding or updating tests
- `chore` — maintenance tasks, dependency updates, build changes
- `perf` — performance improvements
- `ci` — CI/CD changes only

**Examples:**

```
feat(auth): add OAuth2 PKCE login flow

Implements authorization code flow with PKCE for public clients.
Replaces the old implicit flow which is now deprecated.

Closes #123
Refs #456
```

```
fix(api): handle null response from payment provider

The payment provider returns null for failed transactions instead
of a structured error. This caused a TypeError in the webhook handler.

The fix adds a null check before processing the response.
```

**Rules:**
- Subject line: max 72 characters, imperative mood ("add" not "added" or "adds")
- Body: wrap at 72 characters, explain WHY not WHAT
- Reference issues: `Closes #123`, `Refs #456`
- Never commit commented-out code ("temporary fix" — just delete it)

## Rebasing vs Merging

**Rule: Rebase feature branches onto main. Merge main into feature branches for shared code.**

```
# On your feature branch
git fetch origin
git rebase origin/main

# Resolve conflicts, then:
git rebase --continue
git push --force-with-lease
```

**Why `--force-with-lease` over `--force`?** It refuses to push if the remote has commits you haven't seen — safer.

**Never rebase commits that have been pushed to a shared branch.** Rebase only on local or private branches.

**Merge main into shared feature branches** (when multiple people work on the same branch):

```
git checkout shared-feature
git merge origin/main
# Resolve conflicts, commit merge
git push
```

## Managing PRs

**Keep PRs small.** Max 400 lines of code change. Smaller = faster review.

**PR template:**

```markdown
## What
Brief description of what this PR does.

## Why
Context: link to ticket, problem it solves.

## How
Key implementation decisions, anything unusual.

## Testing
How to test this. Local steps, automated tests.

## Screenshots (if UI change)
Before/after screenshots.
```

**PR rules:**
- At least 1 approval required before merge
- All CI checks must pass
- No unresolved conversations
- Branch must be up to date with main
- Self-review before requesting others

## Git Hooks

**Use Husky for commit hooks:**

```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**lint-staged config (package.json):**

```json
{
  "lint-staged": {
    "*.{ts,js,tsx,jsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.{md,json,yml}": ["prettier --write"]
  }
}
```

**Pre-commit hooks should be fast.** Move slow checks to CI.

## Undoing Things

**Undo last commit (keep changes):**
```bash
git reset --soft HEAD~1  # keep staged
git reset HEAD~1          # unstaged
```

**Undo a specific commit (shared branch):**
```bash
git revert <commit-hash>
git push origin <branch>
```

**Interactive rebase (clean up commits before PR):**
```bash
git rebase -i HEAD~5  # last 5 commits
```

Commands in interactive mode: `pick` (use), `squash` (merge), `drop` (remove), `reword` (change message)

## Workflow Summary

1. **Branch:** `git checkout -b feature/ABC-123-my-feature`
2. **Work:** Make changes, commit often with good messages
3. **Sync:** `git fetch origin && git rebase origin/main` (solve conflicts)
4. **Push:** `git push --force-with-lease`
5. **PR:** Open PR, fill template, self-review
6. **Review:** Address feedback, push updates
7. **Merge:** Squash-merge or merge-commit (team decision)
8. **Cleanup:** Delete branch after merge

## Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = log --graph --oneline --all
  amend = commit --amend --no-edit
  undo = reset --soft HEAD~1
  contributors = shortlog --summary --number-trailing --all --按人数排序
```
