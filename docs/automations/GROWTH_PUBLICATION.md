# Weekly Growth Publication Runbook

Run from the repository checkout with access to external automation credentials and Substack browser state.

1. Exit immediately if `PAUSE_ALL` or `PAUSE_PUBLISH` exists.
2. Find the newest verified cycle without a completed publication result.
3. Collect the previous cycle's available metrics and write its `GrowthSnapshot`.
4. Generate three evidence-backed hooks and select the format using the exploration policy.
5. Build one canonical Substack edition, one X thread, and one Reddit-native post. Every factual claim must map to release evidence.
6. Validate content limits, community policy, prohibited language, UTM links, content hashes, credentials, and idempotency keys.
7. Publish Substack first. If it fails, use the GitHub release as the canonical URL and continue with supported adapters.
8. Publish X and one allowed Reddit community. Record each success before continuing.
9. Retry only failed adapters twice with exponential backoff.
10. Append typed results to the cycle ledger and close the cycle when every enabled adapter is successful or policy-blocked.

Report the cycle ID, selected format, publication URLs, skipped or failed platforms, idempotency keys, and metrics baseline. Never claim guaranteed reach or virality.
