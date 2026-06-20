# Autonomous Growth System Design

## Objective

Run two weekly Codex automations for `skill-surge`: one discovers and repairs verified defects, and one publishes evidence-backed release content. The jobs communicate through a versioned GitHub cycle ledger so retries are idempotent and publication never depends on an unfinished repair run.

## Architecture

The self-improvement job runs in an isolated worktree. It refreshes trusted skill metadata, gathers reproducible findings, applies bounded fixes with regression tests, opens pull requests, waits for the `merge-gate` check, enables auto-merge, runs a post-merge canary, and records a release cycle in GitHub Issues.

The publication job runs locally so it can use external credentials and persistent Substack browser state. It reads the latest verified cycle, creates a platform-specific bundle, validates every claim against the release record, publishes once per platform, and records URLs and metrics in ledger comments.

## Trust Boundaries

- The autonomous repair job cannot change CI workflows, automation policy, platform adapters, credential loading, or security policy.
- Secrets remain under `~/.config/skill-surge/` and are never written to the repository or ledger.
- Network writes require an enabled feature flag, a passing policy check, and no active kill switch.
- X and Reddit use official APIs. Substack uses a dedicated Playwright browser profile because its official developer API is read-only.
- A finding is repairable only when a deterministic failing test or command reproduces it.

## Data Flow

1. Refresh trusted local and Git sources into a metadata-only cache.
2. Diagnose build, tests, audit results, GitHub issues, and catalog drift.
3. Repair at most five eligible findings, each within scope limits.
4. Merge only after the stable GitHub `merge-gate` succeeds.
5. Write one immutable `ReleaseRecord` to a GitHub cycle issue.
6. Build and validate one `PublicationBundle` from that record.
7. Publish Substack, X, and one policy-compatible Reddit submission.
8. Append `PublicationResult` and later `GrowthSnapshot` comments.

## Recovery

- A post-merge canary failure creates an automatic revert PR.
- A package already published to npm is corrected with a patch release and deprecated, not silently removed.
- Platform retries reuse idempotency keys and skip recorded successes.
- `PAUSE_ALL`, `PAUSE_SELF_IMPROVE`, and `PAUSE_PUBLISH` stop writes before credentials are loaded.
- Safety-kernel findings are recorded as blocked rather than modified automatically.

## Success Criteria

- No repair merges without a reproduced failure and all checks passing.
- No cycle or platform is published twice.
- Partial publication failures preserve successful results.
- Logs, issues, and artifacts contain no secrets.
- Growth decisions use observed metrics; no outcome or virality is guaranteed.
