---
name: testing-strategies
description: Design and implement a comprehensive testing strategy. Use when writing tests, setting up TDD, configuring test coverage, or planning CI/CD test pipelines. Triggers on: test, coverage, unit, integration, e2e, tdd, vitest, playwright, ci.
---

# Testing Strategies

Production testing patterns. Opinionated. Specific.

## The Test Pyramid

```
         /\
        /  \       E2E Tests (few, slow, expensive)
       /    \       5-10% of total tests
      /------\
     /        \     Integration Tests (medium count)
    /----------\     20-30% of total tests
   /            \
  /--------------\
 /                \   Unit Tests (many, fast, cheap)
/__________________\  60-70% of total tests
```

**80% of your tests should be unit tests.** E2E tests are slow, flaky, and expensive to maintain.

## Unit Tests

**Test one thing in isolation.** Mock everything external.

**Good unit test structure:**
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('creates a user with hashed password', async () => {
      // Arrange
      const db = createMockDb();
      const bcrypt = createMockBcrypt();
      const service = new UserService(db, bcrypt);

      // Act
      const user = await service.createUser({
        email: 'test@example.com',
        password: 'secret123',
      });

      // Assert
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).not.toBe('secret123');
      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 12);
    });

    it('throws ConflictError if email already exists', async () => {
      // Arrange
      const db = createMockDb({
        query: { 'SELECT * FROM users WHERE email = $1': [{ id: 'existing' }] },
      });
      const service = new UserService(db);

      // Act + Assert
      await expect(
        service.createUser({ email: 'existing@example.com', password: 'pass' })
      ).rejects.toThrow(ConflictError);
    });
  });
});
```

**Arrange-Act-Assert (AAA) pattern.** Never mix setup, action, and assertions.

**Test file location:** Next to the file being tested.

```
src/
  services/
    user.ts
    user.test.ts     ← test next to source
```

## Integration Tests

**Test with real database, real cache, mocked external APIs.**

```typescript
describe('UserService (integration)', () => {
  let db: TestDatabase;
  let service: UserService;

  beforeAll(async () => {
    db = await TestDatabase.create();
    service = new UserService(db);
  });

  afterAll(() => db.close());

  beforeEach(() => db.reset());

  it('persists user to database', async () => {
    const user = await service.createUser({
      email: 'persist@example.com',
      password: 'secret123',
    });

    const found = await db.query('SELECT * FROM users WHERE id = $1', [user.id]);
    expect(found).toHaveLength(1);
    expect(found[0].email).toBe('persist@example.com');
  });
});
```

**Use a test database** — never test against production. Use Docker or a separate test DB instance.

## E2E Tests

**Use Playwright for browser testing.**

```typescript
import { test, expect } from '@playwright/test';

test('user can sign up and access dashboard', async ({ page }) => {
  await page.goto('/signup');

  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

**Only write E2E for critical user flows:**
- Sign up / sign in
- Core business workflow (checkout, booking, etc.)
- Checkout/payment
- Account deletion

**Never use E2E for:**
- API testing (use integration tests)
- Testing business logic (use unit tests)
- Testing edge cases (use unit tests)

## Test Coverage

**Don't chase 100% coverage.** Coverage is a warning sign, not a goal.

**Realistic targets:**
- Unit tests: 70-80% line coverage on business logic
- Integration tests: critical paths covered
- E2E: 3-5 core user flows

**Set coverage thresholds as guardrails:**

```json
// vitest.config.ts
export defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
      },
    },
  },
});
```

## TDD Flow

**Red-Green-Refactor:**

1. **Red** — Write a failing test. See it fail.
2. **Green** — Write the minimal code to pass. See it pass.
3. **Refactor** — Clean up. Keep tests passing.

```bash
# Red: write test, run, see it fail
vitest run src/services/user.test.ts
# FAIL: expect(received).toBe(expected)

# Green: minimal implementation
# ...

# Green: run, see it pass
vitest run src/services/user.test.ts
# PASS

# Refactor: clean up
```

**TDD is not about writing tests first.** It's about writing the minimum code that satisfies a test, then refactoring.

## CI/CD Test Pipeline

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit
      - run: npm run test:integration

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

**Run in order:** lint → typecheck → unit → integration → e2e. Fail fast.

## Mocking Guidelines

**Mock at boundaries, not internals:**
- Mock databases, HTTP clients, file system
- Don't mock internal classes/modules

**Use dependency injection for testability:**

```typescript
// GOOD: Injectable dependencies
class UserService {
  constructor(
    private db: Database,
    private mailer: Mailer,
  ) {}

  async createUser(data: UserInput) {
    // ...
    await this.mailer.sendWelcome(data.email);
  }
}

// Test: inject mock mailer
const mailer = createMockMailer();
const service = new UserService(testDb, mailer);
```

**Don't mock what you own.** If it's your code, write real tests for it. Only mock external dependencies.

## Anti-Patterns

**DO NOT:**
- Test implementation details (test behavior, not internal state)
- Write tests that depend on execution order
- Create test databases in `beforeAll` and never clean them
- Assert on timestamps, random values, or auto-generated IDs
- Use `sleep()` for async tests — use proper async/await or wait utilities
- Write tests that only assert `toBeTruthy()` or `toBeDefined()`
