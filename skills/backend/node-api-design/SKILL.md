---
name: node-api-design
description: Production Node.js API patterns including RESTful design, middleware architecture, error handling, validation, and API security.
category: backend
---

# Node API Design

## RESTful Design
- Use nouns for resources: `/users`, `/articles`, `/orders`
- HTTP verbs: GET (read), POST (create), PUT (replace), PATCH (update), DELETE
- Nest resources logically: `/users/:id/orders/:orderId`
- Pagination: `?page=1&limit=20`, return `{ data, meta: { total, page, limit } }`
- Versioning: Accept header (`application/vnd.api+json;version=1`) or URL prefix (`/v1/`)

## Middleware Architecture
- Order: security → parsing → logging → auth → routes → error handler
- Security: helmet, cors, rate limiting
- Body parsing: express.json() with size limits
- Error handler: centralized middleware that catches all errors

## Error Handling
- Use a custom `AppError` class with status code, message, and optional details
- Never expose stack traces in production
- Consistent error response shape: `{ error: { code, message, details? } }`
- Catch async errors with a wrapper: `asyncHandler(fn)`

## Validation
- Validate input at the boundary (middleware or route handler)
- Zod or Joi for schema validation
- Validate before processing — fail fast

## Security
- Helmet for HTTP headers, CORS for cross-origin, rate limiting for abuse
- Input sanitization, parameter pollution prevention
- Use environment variables for secrets, never hardcode
- HTTPS only in production

## Project Structure
```
src/
  routes/        # Route definitions, thin — delegate to controllers
  controllers/   # Request handling, validation, response
  services/      # Business logic
  middleware/    # Custom middleware
  models/        # Data models/schemas
  utils/         # Helpers, errors, logger
```
