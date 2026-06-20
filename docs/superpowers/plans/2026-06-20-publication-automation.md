# Publication Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one evidence-backed weekly edition to Substack, X, and Reddit and use measured engagement to improve future formats.

**Architecture:** A validated `PublicationBundle` feeds isolated adapters. Each adapter records its idempotency key immediately, while the metrics collector writes a versioned growth snapshot for the next cycle.

**Tech Stack:** TypeScript, native fetch, Playwright, Node Test Runner, platform APIs.

---

### Task 1: Bundle and Content Policy

- [ ] Write failing tests for evidence validation, duplicate claims, UTM links, content limits, and prohibited growth language.
- [ ] Implement hook selection, canonical content, platform variants, and deterministic content hashes.
- [ ] Verify `automation publish <bundle> --dry-run` performs no network writes.
- [ ] Commit `feat: add publication bundle validation`.

### Task 2: Platform Adapters

- [ ] Write failing adapter contract tests using injected HTTP and browser transports.
- [ ] Implement X OAuth posting, Reddit OAuth/rules/submission, and Substack Playwright publishing.
- [ ] Record successful results before another adapter runs.
- [ ] Verify retries skip recorded successes.
- [ ] Commit `feat: add idempotent multi-platform publisher`.

### Task 3: Metrics and Format Selection

- [ ] Write failing tests for metric normalization and the four-cycle exploration policy.
- [ ] Implement X, Reddit, Substack, GitHub, and npm metric collection.
- [ ] Implement 70/30 exploitation/exploration beginning with cycle five.
- [ ] Verify missing platform metrics remain optional and do not invent values.
- [ ] Commit `feat: add publication analytics feedback loop`.
