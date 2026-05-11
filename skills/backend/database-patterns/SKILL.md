---
name: database-patterns
description: Database design patterns for SQL and NoSQL, query optimization, migration strategies, connection pooling, and data modeling best practices.
category: backend
---

# Database Patterns

## SQL Best Practices
- Use Prisma, Drizzle, or TypeORM for type-safe queries
- Index columns used in WHERE, JOIN, and ORDER BY clauses
- Use `EXPLAIN ANALYZE` to identify slow queries
- Prefer `JOIN` over nested subqueries where possible
- Use connection pooling (PgBouncer, Prisma Accelerate) in serverless

## NoSQL (MongoDB / DynamoDB)
- Design documents around access patterns, not relational normalization
- Use embedded documents for tightly-coupled data (max 16MB doc size)
- Use references for loosely-coupled or frequently-accessed data
- Create compound indexes matching query patterns
- Use aggregation pipeline for complex transforms

## Migrations
- Always use migration tools (Prisma Migrate, Knex, TypeORM migrations)
- One migration per logical change, always reversible
- Test migrations against a staging database before production
- Never edit existing migrations — create new ones

## Connection Management
- Use a singleton connection pool
- Set reasonable pool limits (10-25 connections depending on workload)
- Implement retry logic with exponential backoff
- Health-check connections before use

## Query Optimization
- Select only needed columns, never `SELECT *`
- Batch inserts with `INSERT ... VALUES (...), (...)`
- Use `LIMIT` + `OFFSET` or cursor-based pagination
- Avoid N+1: use eager loading or batch loading (DataLoader)

## Caching
- Cache frequent read queries (Redis, node-cache)
- Cache invalidation: TTL-based or event-driven
- Never cache as a substitute for missing indexes
