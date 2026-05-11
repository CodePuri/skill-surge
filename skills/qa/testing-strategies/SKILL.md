---
name: testing-strategies
description: Comprehensive testing strategies including unit tests, integration tests, E2E tests, TDD approach, and testing infrastructure setup.
category: qa
---

# Testing Strategies

## Test Pyramid
- **Unit tests** (70%): Test individual functions, hooks, utilities in isolation
- **Integration tests** (20%): Test module interactions, API endpoints, database queries
- **E2E tests** (10%): Test critical user flows through the full stack

## Unit Testing
- Framework: Vitest (frontend), Jest/Vitest (backend)
- Test behavior, not implementation — avoid testing private methods
- Use descriptive test names: `describe('calculateDiscount')` / `it('applies 10% off for orders over $100')`
- One assertion per test when possible
- Mock external dependencies (API calls, database) — never make real network calls

## Integration Testing
- Test API endpoints with supertest (Express) or Fastify's built-in test utilities
- Test database operations with a test database or in-memory SQLite
- Test middleware chains
- Verify error responses, status codes, and response shapes

## E2E Testing
- Playwright (recommended) or Cypress
- Test critical paths: login, signup, core feature flows, checkout
- Use data-testid attributes for selectors (avoid CSS class dependencies)
- Run against a staging or preview deployment

## TDD Approach
1. Write a failing test (red)
2. Write minimal code to make it pass (green)
3. Refactor while keeping tests green
4. Commit with passing tests

## Coverage Goals
- 80%+ line coverage for business logic
- 90%+ coverage for critical paths (auth, payments, data mutations)
- Enforce in CI with coverage thresholds

## CI Integration
- Run unit + integration tests on every PR
- Run E2E tests before merge to main
- Fail build if tests fail or coverage drops below threshold
