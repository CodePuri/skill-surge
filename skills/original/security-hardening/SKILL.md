---
name: security-hardening
description: Harden application security against common vulnerabilities. Use when reviewing security, fixing vulnerabilities, setting up CSP, handling input sanitization, or configuring rate limiting. Triggers on: security, xss, csrf, injection, csp, helmet, sanitize, headers.
---

# Security Hardening

Production security patterns. Opinionated. Specific.

## Security Headers

**Add Helmet.js first.** It's the foundation.

```typescript
import helmet from 'helmet';
app.use(helmet());

// Fine-tune for your app:
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://cdn.example.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.example.com'],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
}));

app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true,
}));
```

**Essential headers to verify:**
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN`
- [ ] `X-XSS-Protection: 1; mode=block` (deprecated but still worth setting)
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` (restrict camera, mic, geolocation)

## Input Sanitization

**Never trust user input. Ever.**

```typescript
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title'],
});
```

**For SQL — parameterized queries always:**
```sql
-- GOOD
SELECT * FROM users WHERE id = $1;

-- BAD (never do this)
SELECT * FROM users WHERE id = ${userId};
```

**For filenames uploaded by users:**
- Strip path traversal (`../`, `..\\`)
- Replace special characters with underscores
- Use a safe filename: `const safeName = sanitize(filename).replace(/[^a-zA-Z0-9._-]/g, '_')`
- Store files outside web root or in cloud storage (S3)

## CSRF Protection

**For state-changing requests:**
- Use `SameSite` cookies (strongest defense)
- Add CSRF tokens for form submissions (especially without SameSite)
- Verify `Origin` or `Referer` header for API requests

**SameSite cookie is the default in modern browsers.** Set it explicitly:

```typescript
res.cookie('sessionId', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // or 'lax' if you need cross-site POST
});
```

**For AJAX/API calls:**
- Verify `Origin` header matches your domain
- Use `csurf` middleware for forms, token-based for API
- For SPAs: store CSRF token in a `<meta>` tag and send as `X-CSRF-Token` header

## Rate Limiting

**Per-IP and per-user limits:**

```typescript
import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 failed logins per 15 minutes per IP
  skipSuccessfulRequests: true,
});

app.use(globalLimiter);
app.use('/auth/login', authLimiter);
```

**Also implement at API gateway level** if using one (Cloudflare, Nginx, AWS API Gateway).

## Secrets Management

**Never hardcode secrets.** Use environment variables or a secrets manager.

```typescript
// BAD
const secret = 'my-super-secret-key';

// GOOD
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET must be set');
```

**Rotation strategy:**
- Rotate secrets without downtime (have two valid keys during transition)
- Store in a secrets manager (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager)
- Never commit `.env` files
- Use `.env.example` with all required vars listed but values empty

**For Docker/Kubernetes:**
- Use Kubernetes secrets for small values
- Use external secrets managers for large configs
- Never bake secrets into container images

## Dependency Security

**Audit dependencies regularly:**

```bash
npm audit --audit-level=high
npx sockr puppet-audit
```

**Dependabot or Renovate** for automatic security updates:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    security-updates: true
```

## OWASP Top 10 Check

Verify your app against the latest OWASP Top 10:

1. **Broken Access Control** — verify every endpoint checks permissions
2. **Cryptographic Failures** — no MD5/SHA1 for passwords, TLS 1.2+
3. **Injection** — parameterized queries, input validation
4. **Insecure Design** — threat model for new features
5. **Security Misconfiguration** — headers, defaults, unnecessary features
6. **Vulnerable Components** — `npm audit`, update regularly
7. **Auth Failures** — password policy, MFA, session management
8. **Integrity Failures** — subresource integrity for CDN resources
9. **Logging Failures** — log security events, verify monitoring
10. **SSRF** — validate and sanitize all URLs provided by users

## Security Checklist

- [ ] Helmet.js middleware active
- [ ] Rate limiting on auth endpoints
- [ ] CSRF tokens for forms
- [ ] Input validation on all user-provided data
- [ ] SQL parameterized queries (no string concatenation)
- [ ] Secrets in env vars, not in code
- [ ] Dependencies audited (`npm audit`)
- [ ] Security headers verified
- [ ] Error messages don't leak internal details
- [ ] File uploads validated and stored safely
- [ ] HTTPS enforced in production
- [ ] `sameSite` cookies set
