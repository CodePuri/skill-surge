# Weekly Self-Improvement Runbook

Run only in an isolated worktree. Use the repository's configured Node runtime and GitHub authentication.

1. Exit immediately if `PAUSE_ALL` or `PAUSE_SELF_IMPROVE` exists.
2. Run `npm ci`, `npm run build`, and the complete test suite with a temporary `SKILL_SURGE_CACHE`.
3. Run `node dist/cli.js refresh --network --json` and `node dist/cli.js automation diagnose --json`.
4. Open or reuse the current ISO-week cycle issue.
5. Prioritize security, regressions, CI failures, reproducible bug issues, catalog drift, then model-discovered defects.
6. Process at most five findings. Require a failing regression test before editing production code.
7. Reject changes that exceed scope or touch protected safety paths; record them with `automation:blocked`.
8. For each eligible fix, create a branch and PR, run all checks, enable squash auto-merge, and wait for `merge-gate`.
9. After merge, run the clean-main canary. Create an automatic revert PR if it fails.
10. If package contents changed, create the patch release PR, tag the merged version, and wait for npm/GitHub release success.
11. Validate and append one immutable `ReleaseRecord` to the cycle issue.

Report the cycle ID, findings considered, PRs merged or blocked, checks, release version, ledger URL, and any rollback.
