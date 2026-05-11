---
name: error-handling
description: Implement consistent error handling across the application. Use when handling errors, logging exceptions, integrating Sentry, creating custom error classes, or building debug tools. Triggers on: error, exception, try-catch, throw, debug, sentry, log.
---

# Error Handling

Consistent, actionable error handling patterns. Opinionated. Specific.

## Error Class Hierarchy

**Create a typed hierarchy.** Never throw raw strings.

```typescript
// errors/base.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// errors/400.ts — client errors
export class BadRequest extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, 'BAD_REQUEST', details);
  }
}
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(422, message, 'VALIDATION_ERROR', details);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
  }
}
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMITED');
  }
}
```

**Keep it simple.** One file with all error classes. No need for a complex directory structure.

## Error Response Shape

**Always return the same shape:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "name", "message": "Name must be at least 2 characters" }
    ],
    "requestId": "req_abc123"
  }
}
```

**Never expose:**
- Stack traces to clients
- Database error messages
- Internal file paths
- Environment variable names
- Third-party API error details

## Centralized Error Handler

**In Express/Koa/Fastify — one middleware at the end:**

```typescript
// middleware/error-handler.ts
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
    return;
  }

  // Unknown error — log full details, return sanitized message
  console.error('UNHANDLED ERROR:', {
    requestId,
    url: req.url,
    method: req.method,
    stack: err.stack,
    originalError: err,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    },
  });
}
```

## Try-Catch Patterns

**Wrap service layer calls, not every function:**

```typescript
// BAD: Every function wrapped
async function createUser(data: UserInput) {
  try {
    return await userService.create(data);
  } catch (err) {
    throw err;
  }
}

// GOOD: Just the service call
async function createUser(data: UserInput) {
  return userService.create(data);
}

// routes/user.ts — catch at the boundary
router.post('/users', async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err); // Let centralized handler deal with it
  }
});
```

**Never swallow errors with empty catch blocks.** At minimum, log them.

## Async Error Wrapping

**Express doesn't catch async errors automatically.** Use a wrapper:

```typescript
const asyncHandler = (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Usage:
router.post('/users', asyncHandler(async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
}));
```

## Logging

**Log errors with context.** Not just the message.

```typescript
import pino from 'pino';

const logger = pino();

try {
  await userService.create(data);
} catch (err) {
  logger.error({
    err,
    userId: req.user?.id,
    requestId: req.headers['x-request-id'],
    url: req.url,
    method: req.method,
    body: req.body, // careful: may contain passwords
  }, 'Failed to create user');
  throw err;
}
```

**Use structured logging** (JSON). It's parseable, searchable, and log aggregators (Datadog, Grafana, Loki) handle it natively.

**Never log passwords, tokens, API keys, or PII.** Scrub them.

## Sentry Integration

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({ dsn: process.env.SENTRY_DSN });

// In error handler:
if (err instanceof AppError) {
  Sentry.captureMessage(err.message, {
    level: 'info',
    tags: { code: err.code },
    extra: { details: err.details },
  });
} else {
  Sentry.captureException(err, {
    extra: { requestId, url: req.url },
  });
}
```

**Set `tracesSampleRate` based on traffic:**
- High traffic: `0.01` (1%)
- Low traffic: `0.1` (10%)

**Set `initialScope` with user info on authenticated requests:**

```typescript
Sentry.setUser({ id: req.user.id, email: req.user.email });
```

## Operational vs Programmer Errors

**Two types of errors:**

1. **Operational** — foreseeable, handleable: bad input, network timeout, resource not found. Show user-friendly message.

2. **Programmer** — bugs, unexpected: null access, array out of bounds. Log full context, return generic 500.

**Never treat programmer errors as operational.** Don't try-catch every possible edge case. Let unexpected errors propagate and log with full context.

## Retry Patterns

**For transient failures (network, DB connection):**

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options = { retries: 3, delay: 100 }
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (isRetryable(err)) {
        await sleep(options.delay * Math.pow(2, i));
        continue;
      }
      throw err;
    }
  }
  throw lastError!;
}
```

**Only retry on:**
- Network timeouts
- 503 Service Unavailable
- 429 Too Many Requests
- Connection refused

**Never retry on:** 400, 401, 403, 404, 422, 500
