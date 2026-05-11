---
name: code-review-excellence
description: Code review best practices, what to look for in reviews, constructive feedback patterns, and establishing a healthy review culture.
category: qa
---

# Code Review Excellence

## What to Check
- **Correctness**: Does the code do what it's supposed to? Are edge cases handled?
- **Security**: Input validation, auth checks, SQL injection, XSS, CSRF
- **Performance**: N+1 queries, missing indexes, unnecessary re-renders
- **Maintainability**: Clear naming, appropriate abstraction, comments for why not what
- **Test coverage**: Are there tests for new code? Do existing tests still pass?

## Review Flow
1. Understand the context — read the ticket/issue first
2. Skim the diff to understand the scope
3. Read critical files first (business logic, data layer, auth)
4. Leave feedback grouped by severity

## Feedback Patterns
- **Critical**: Blocking issues that must be fixed (bugs, security, data loss)
- **Should**: Important but non-blocking (performance, maintainability)
- **Nitpick**: Style preferences, minor improvements

## Writing Good Comments
- Explain the *why* behind the feedback
- Be specific: "This query will cause an N+1 on line 47" not "This is slow"
- Offer solutions: "Consider using createSelector to memoize this"
- Use a kind, constructive tone — assume good intent

## Code Review Checklist
- [ ] No debug code, console.log, or TODO comments in production code
- [ ] Error handling is appropriate (try/catch, error boundaries)
- [ ] Logging is present for important operations
- [ ] Configuration is environment-aware (env vars, not hardcoded)
- [ ] API responses follow consistent format
- [ ] Database migrations are reversible
- [ ] New dependencies are justified and vetted
