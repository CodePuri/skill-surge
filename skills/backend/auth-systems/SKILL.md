---
name: auth-systems
description: Authentication and authorization patterns including JWT, OAuth2, session management, RBAC, and security best practices for web applications.
category: backend
---

# Auth Systems

## JWT Authentication
- Access token (short-lived, 15min) + Refresh token (long-lived, 7 days)
- Store tokens: access in memory, refresh in httpOnly secure cookie
- Sign with RS256 (asymmetric) — use public key for verification only
- Include minimal claims: `sub`, `iat`, `exp`, `scope`
- Implement token rotation for refresh tokens

## OAuth2 / Social Login
- Use standardized providers (Google, GitHub, Apple)
- PKCE flow for mobile/SPA apps
- Authorization Code flow for server-side apps
- Store provider ID + user ID mappings in a separate table

## Session Management
- Server-side sessions: store in Redis, not in memory (for scale)
- Session ID in httpOnly, Secure, SameSite=Strict cookie
- Rotate session ID on login (prevession fixation)
- Implement session revocation endpoint

## Authorization (RBAC)
- Roles: `admin`, `user`, `viewer` with hierarchical permissions
- Check permissions at the middleware level, not in route handlers
- Use a permission registry: `{ "articles:create": ["admin", "editor"] }`
- Cache user permissions in the request context after authentication

## Security Checklist
- Hash passwords with bcrypt (cost factor 12) or argon2
- Rate limit login attempts (5 attempts per 15 minutes)
- Implement account lockout after failed attempts
- CSRF tokens for cookie-based auth
- Log all auth events (login, logout, failed attempts, role changes)
- Use `helmet` for security headers in Express/Fastify
