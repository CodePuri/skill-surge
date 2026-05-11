---
name: auth-systems
description: Design and implement secure authentication and authorization systems. Use when building login, signup, OAuth flows, JWT tokens, session management, RBAC, password hashing, or securing routes. Triggers on: auth, login, signup, jwt, oauth, session, rbac, bcrypt, password, token.
---

# Auth Systems

Security-first auth patterns. Opinionated. Specific.

## Password Security

**Always hash passwords.** Never store in plain text. Never encrypt.

**Use bcrypt with cost factor 12.** Not less. Not scrypt or Argon2 unless your team knows what they're doing.

```typescript
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12);
// Verification
const valid = await bcrypt.compare(plaintext, hash);
```

**Password policy:**
- Minimum 8 characters (let users choose long passwords — length > complexity)
- No password complexity rules that encourage predictable patterns
- Check against known-breached passwords: use `hibp` API or similar

**Never** send passwords via email. Ever. Send password reset links with time-limited tokens.

## JWT Patterns

**Use RS256 (asymmetric).** Not HS256 (symmetric). RS256 is safer: private key signs, public key verifies.

**Token structure:**

```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1715000000,
  "exp": 1715003600
}
```

**Access token lifetime:** 15-60 minutes
**Refresh token lifetime:** 7-30 days

**Store refresh tokens in httpOnly cookies**, not localStorage. XSS can steal localStorage but not httpOnly cookies.

**Always verify JWT signature** before trusting any claim.

```typescript
import jwt from 'jsonwebtoken';
const publicKey = process.env.JWT_PUBLIC_KEY!;
const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

**Never store JWT tokens in URLs.** URLs end up in server logs, browser history, referrer headers.

## OAuth 2.0 / PKCE

**Always use PKCE** for public clients (SPAs, mobile apps). Authorization code without PKCE is unsafe.

**Flow:**
1. Generate `code_verifier` (random 43-128 char string)
2. Hash it → `code_challenge` (base64url(SHA256(code_verifier)))
3. Redirect to `/authorize?response_type=code&client_id=...&code_challenge=...&code_challenge_method=S256`
4. Exchange `code` for tokens using `code_verifier`

**Never expose client secrets in public clients.** They're not secret in browser JS.

**Scope principle:** Request minimum scopes. `email profile` is enough for most auth flows. Don't request `offline_access` unless you actually need refresh tokens.

## Sessions

**Database sessions for server-rendered apps.** Redis or PostgreSQL.

**Session schema:**
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);
```

**Session fixation prevention:**
- Regenerate session ID after successful login
- Invalidate old session on login from new device

**Cookie settings:**
- `HttpOnly: true` — prevent XSS read
- `Secure: true` — HTTPS only (disable in local dev)
- `SameSite: 'Strict'` or `'Lax'` — CSRF protection
- `Path: '/'`
- `Max-Age` or `Expires` — set explicit lifetime

## RBAC (Role-Based Access Control)

**Principle of least privilege.** Start with no permissions, grant only what's needed.

**Role hierarchy:**
```
superadmin → admin → moderator → user → guest
```

**Implementation — permission-based, not role-based:**

```typescript
// Permissions are specific, not tied to role names
const PERMISSIONS = {
  'user:read': ['admin', 'moderator', 'user'],
  'user:write': ['admin', 'moderator'],
  'user:delete': ['admin'],
  'billing:read': ['admin', 'finance'],
  'billing:write': ['admin'],
};

function can(userRole: string, permission: string): boolean {
  return PERMISSIONS[permission]?.includes(userRole) ?? false;
}
```

**Check at route level, not just data level.** Both need to agree.

```typescript
router.delete('/users/:id', authenticate, (req, res) => {
  if (!can(req.user.role, 'user:delete')) {
    throw new ForbiddenError('Insufficient permissions');
  }
  // ... handler
});
```

## 2FA / MFA

**Offer TOTP (Google Authenticator, Authy) as second factor.** SMS is not secure — SIM swap attacks are real.

**TOTP setup flow:**
1. Generate secret: `import { authenticator } from 'otplib'; const secret = authenticator.generateSecret();`
2. Generate QR code URI for authenticator apps
3. Store `totp_secret` encrypted in DB (user must verify first TOTP code before enabling)
4. On login: prompt for 2FA code after password verification

**Backup codes:** Generate 10 single-use backup codes. Store hashed. Warn user to save them.

**Rate limit 2FA attempts:** 5 attempts per 15 minutes per account. Lock account after 10 failed attempts.

## Security Anti-Patterns

**DO NOT:**
- Store passwords in plain text or with reversible encryption
- Use MD5 or SHA1 for passwords
- Put tokens in URLs
- Skip CSRF protection for state-changing requests
- Trust `X-Forwarded-For` without validation (IP spoofing)
- Store sensitive data in localStorage
- Use `eval()` or `new Function()` with user input
- Authorize based only on client-side checks
