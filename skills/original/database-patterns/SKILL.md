---
name: database-patterns
description: Design and optimize database schemas, queries, and migrations. Use when writing SQL, designing schemas, optimizing queries, setting up migrations, handling connection pooling, or using Redis for caching. Triggers on: sql, postgres, mysql, mongodb, migration, index, query, redis, orm, schema.
---

# Database Patterns

Production database patterns. Opinionated. Specific.

## Schema Design

**Naming conventions:**
- Table names: `plural_snake_case` (`users`, `order_items`)
- Column names: `snake_case` (`created_at`, `user_id`)
- Primary keys: `id` (UUID or bigint, never auto-incrementing int as the only option)
- Foreign keys: `<table>_id` (`user_id`, `order_id`)
- Indexes: `idx_<table>_<columns>` (`idx_users_email`)

**UUID vs bigint:**
- Use **UUID v7** for distributed systems, multi-region databases, or when IDs shouldn't be guessable
- Use **bigint** for high-throughput, sequential reads, simple JOINs
- Never expose internal bigint IDs directly — use a separate public token

**Soft deletes over hard deletes** for most user-facing data. Use `deleted_at TIMESTAMP NULL` column.

```sql
SELECT * FROM users WHERE deleted_at IS NULL;
-- Never: SELECT * FROM users WHERE id = 5;
```

## Indexing

**Add indexes for:**
- Every foreign key column
- Every column used in WHERE, ORDER BY, or JOIN conditions
- Columns with high cardinality used in filters
- Composite indexes when multiple columns are queried together

**Composite index column order:** Put the most selective column first, unless a range query changes that.

**DO NOT:**
- Index low-cardinality columns (boolean, status)
- Index every column "just in case"
- Add indexes without measuring query performance first

**Use `EXPLAIN ANALYZE` before and after adding indexes:**

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';
```

**Partial indexes** for frequently filtered subsets:

```sql
CREATE INDEX idx_orders_pending ON orders (created_at)
WHERE status = 'pending';
```

## Query Optimization

**N+1 query problem — always check for it:**

```typescript
// BAD: N+1 queries
const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
for (const order of orders) {
  order.items = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
}

// GOOD: Single JOIN or batched queries
const orders = await db.query(`
  SELECT o.*, json_agg(oi.*) as items
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  WHERE o.user_id = $1
  GROUP BY o.id
`, [userId]);
```

**Use EXPLAIN ANALYZE to find sequential scans** on large tables. A seq scan on a table with 1M rows in a WHERE clause = add an index.

**Avoid `SELECT *`.** Always specify columns. It prevents issues when schema changes and reduces data transfer.

## Connection Pooling

**Always use a pool.** Never open a connection per request.

```typescript
import { Pool } from 'pg';
const pool = new Pool({
  max: 20,           // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Pool sizing:**
- PostgreSQL default max: 100 connections per process
- Calculate: `maxPoolSize = (coreCount * 2) + effective_spindle_count`
- For most web apps: 10-20 is enough
- Use PgBouncer in transaction mode for higher concurrency

**Set statement_timeout** to prevent runaway queries:

```sql
ALTER DATABASE db SET statement_timeout = '10s';
```

## Migrations

**Use migrations for every schema change.** Never alter production tables manually.

**Always:**
- Test migrations on a copy of production data first
- Make migrations backward-compatible (add nullable columns first, backfill, then add constraints)
- Add indexes in separate migrations (can be done without downtime)
- Never drop columns in the same migration that removes code using them

**Migration anti-patterns:**

```sql
-- BAD: Drop column immediately
ALTER TABLE users DROP COLUMN legacy_data;

-- GOOD: Two-phase removal
-- Migration 1: Mark column as deprecated (add nullable, remove code references)
ALTER TABLE users ADD COLUMN legacy_data_backup TEXT;
-- Migration 2: Backfill, remove old column
ALTER TABLE users DROP COLUMN legacy_data;
ALTER TABLE users DROP COLUMN legacy_data_backup;
```

**Never rename columns directly.** Use add → backfill → swap → remove pattern.

## Redis Caching

**Cache patterns:**

**1. Cache-aside (read-through):**
```typescript
async function getUser(id: string) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

**2. Write-through:**
On write, update both DB and cache simultaneously.

**TTL原则:**
- Session data: match session lifetime
- User profiles: 5-15 minutes
- Static config: 1-24 hours
- Never cache indefinitely without invalidation

**Cache invalidation:**
- Delete on update, don't update in place
- Use cache tags for group invalidation
- Set reasonable TTLs as safety net

## Query Builder vs Raw SQL vs ORM

**Raw SQL** for: complex joins, window functions, CTEs, performance-critical queries.
**Query builder** (Knex, Drizzle) for: 80% of queries, type safety, migration support.
**ORM** (Prisma, TypeORM) for: rapid prototyping, simple CRUD, schema-first teams.

**Prisma is the default choice** for new Node.js projects unless there's a specific reason to avoid it.

## NoSQL Considerations

**Use MongoDB when:**
- Document structure varies significantly
- Write-heavy workloads without complex joins
- Rapid iteration on schema (though Prisma now handles this)

**Use PostgreSQL when:**
- Data integrity is critical
- Complex relationships between entities
- Need for analytics queries
- JSONB is sufficient for most semi-structured needs

**Denormalize deliberately.** Redundant data for read performance is fine. Don't denormalize before measuring.

## Backup and Recovery

- [ ] Point-in-time recovery enabled
- [ ] Backup tested quarterly (restore to fresh DB, run smoke tests)
- [ ] Replication to standby for read scaling
- [ ] Slow query log enabled and reviewed weekly
