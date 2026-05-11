---
name: node-api-design
description: Design and build production-ready REST APIs with Node.js. Use when building APIs, designing endpoints, implementing middleware, adding validation, handling errors, or securing routes. Triggers on: api, endpoint, route, express, rest, middleware, validation, zod, helmet, cors, rate-limit.
---

# Node.js API Design

Production-ready API patterns for Node.js. Opinionated. Specific.

## REST Conventions

**URL structure:**
- Nouns, plural: `/users`, `/orders`, `/products`
- Never verbs: `/getUser` is wrong → `/users`
- Nest relationships max 2 levels: `/users/:id/orders`
- Versioning: `/v1/`, `/v2/` prefix or header-based

**HTTP methods:**
- `GET` — read, never modify
- `POST` — create
- `PUT/PATCH` — update (PUT = replace, PATCH = partial)
- `DELETE` — remove

**Status codes:**
- `200` — success with body
- `201` — resource created
- `204` — success, no body
- `400` — bad request (client error)
- `401` — not authenticated
- `403` — authenticated but forbidden
- `404` — not found
- `409` — conflict
- `422` — validation error
- `500` — server error

## Error Handling

**Always use a centralized error handler.** Never scatter try/catch throughout the codebase.

```typescript
// error-handler.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 400 class
export class BadRequest extends AppError {
  constructor(message: string) {
    super(400, message, 'BAD_REQUEST');
  }
}

// 404 class
export class NotFound extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}
```

**Always return consistent error shapes:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email"
  }
}
```

**Never leak stack traces in production.** Log full details server-side, return sanitized message to client.

## Input Validation

**Use Zod. Always.** Never trust client data.

```typescript
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2).max(100),
  role: z.enum(['admin', 'user']).default('user'),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({ role: true });

// In route handler:
const result = CreateUserSchema.safeParse(req.body);
if (!result.success) {
  throw new ValidationError(result.error.format());
}
```

**Validate in route layer, not just DB layer.** Defense in depth.

## Middleware Patterns

**3 types, in order:**

1. **Auth middleware** — runs first, attaches `req.user`
2. **Validation middleware** — parses and validates body/params/query
3. **Route handlers** — business logic only

**Never put business logic in middleware.** Keep middleware thin.

```typescript
// auth.ts — middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new UnauthorizedError('Missing token');
  try {
    req.user = verifyJWT(token);
    next();
  } catch {
    throw new UnauthorizedError('Invalid token');
  }
}

// routes/user.ts — handler
router.post('/users', authenticate, async (req, res) => {
  // req.user is guaranteed to exist here
  const user = await userService.create(req.user.id, req.body);
  res.status(201).json(user);
});
```

## Security Checklist

- [ ] **Helmet.js** — security headers (XSS protection, content-type sniffing, etc.)
- [ ] **CORS** — explicit origins only, never `*` with credentials
- [ ] **Rate limiting** — per-IP and per-user limits (`express-rate-limit`)
- [ ] **Input sanitization** — strip HTML script tags from user input
- [ ] **SQL injection** — use parameterized queries (never string concatenation)
- [ ] **JWT secrets** — minimum 256-bit, stored in env vars
- [ ] **Environment separation** — dev/staging/prod configs, no hardcoding

## Pagination

**Always paginate list endpoints.** No exceptions.

```typescript
// Query params: ?page=1&limit=20
export function paginate(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return { limit: Math.min(limit, 100), offset }; // cap at 100
}
```

Return in response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 342,
    "totalPages": 18
  }
}
```

## Async Patterns

**Always use async/await.** Never use `.then().catch()` chains.

**Unhandled rejections crash the server.** Always handle:

```typescript
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION', err);
  process.exit(1);
});
```

**Wrap route handlers in a catch wrapper:**

```typescript
const asyncHandler = (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

## Versioning Strategy

- **Major version** in URL: `/v1/users`, `/v2/users`
- **Changelog** for each breaking change
- **Deprecation** headers on old versions: `Deprecation: true`, `Sunset: <date>`
- Keep old versions running for at least 6 months after new version release
