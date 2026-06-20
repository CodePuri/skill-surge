# Self-Improvement Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bounded weekly repair pipeline that refreshes metadata, proves defects, merges passing fixes, and records releases.

**Architecture:** Versioned contracts and a fail-closed policy kernel guard refresh, diagnostics, GitHub ledger, and release orchestration. GitHub branch protection and a stable `merge-gate` remain the final merge authority.

**Tech Stack:** TypeScript, Node.js 24, Node Test Runner, GitHub CLI, GitHub Actions, npm OIDC.

---

### Task 1: Contracts and Policy

- [ ] Write failing tests for configuration, kill switches, protected paths, redaction, and scope limits.
- [ ] Run `npm run build && node --test tests/automation/policy.test.ts` and confirm the missing-module failure.
- [ ] Implement `src/automation/contracts.ts` and `src/automation/policy.ts`.
- [ ] Re-run the focused test and full `npm test`.
- [ ] Commit `feat: add autonomous automation safety kernel`.

### Task 2: Refresh and Diagnostics

- [ ] Write failing refresh and diagnostic tests with temporary local Git fixtures.
- [ ] Implement metadata hashing, cache recovery, trusted source inspection, and deterministic findings.
- [ ] Add `refresh --network --json` and `automation diagnose --json` command routing.
- [ ] Verify JSON output against the versioned contracts.
- [ ] Commit `feat: add refresh and diagnostic pipeline`.

### Task 3: CI, Ledger, and Release

- [ ] Write failing ledger idempotency and typed-comment tests.
- [ ] Implement the GitHub issue ledger and release validation.
- [ ] Add `ci.yml`, `publish.yml`, and the release orchestration script.
- [ ] Verify build, tests, audit, CLI smoke, and package contents.
- [ ] Commit `feat: add verified autonomous release pipeline`.
