---
name: system-design
description: Design scalable, resilient systems. Use when designing system architecture, scaling services, planning databases, handling concurrency, or explaining system tradeoffs. Triggers on: system-design, scalability, microservices, cdn, caching, database, load-balancer, queue.
---

# System Design

Scalable system architecture patterns. Opinionated. Specific.

## Scalability Basics

**Scale out, not up.** Horizontal scaling (more machines) > vertical scaling (bigger machines).

**Stateless services:** Don't store user data in process memory. Put it in a shared store (Redis, DB). This enables horizontal scaling.

**Design for the load you're expecting + 10x headroom.** Over-engineering for 1M users when you have 100 users is waste. But design decisions that are hard to reverse (monolith vs microservices) matter.

**Estimate with back-of-envelope:**

```
Requests per second = users × requests_per_user ÷ seconds_per_day
Bandwidth = requests_per_second × bytes_per_request
Storage = users × bytes_per_user_per_month × retention_months
```

## Caching

**Cache at the right layer:**

```
Browser → CDN → Load Balancer → Reverse Proxy → Application → Database
  ↑         ↑                      ↑
  Cache   Cache                  Cache
```

**Cache invalidation rules:**
1. **Delete on write, not update in place.** Simpler and safer.
2. **Set TTLs as safety nets.** Even if invalidation fails, data expires.
3. **Cache stamps:** Use distributed locks (Redis SETNX) to prevent cache stampedes when a key expires.

**Cache-aside pattern:**
```typescript
async function getUser(id: string) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

**CDN for static assets:**
- JS, CSS, images, fonts → CDN always
- TTL: 1 year for versioned assets (immutable)
- Short TTL for HTML pages (5 minutes or less)

## Database Scaling

**Read replicas for read-heavy workloads:**

```
Primary DB ──writes──→ Replica 1 (read)
                          Replica 2 (read)
                          Replica 3 (read)
```

**Sharding for write-heavy workloads:**
- Shard by user_id or tenant_id (most common)
- Consistent hashing for even distribution
- Cross-shard queries are expensive — design schema to minimize them

**Connection pooling is non-negotiable.** Use PgBouncer in transaction mode for high concurrency.

## Message Queues

**Use queues when:**
- Async processing (sending emails, processing uploads)
- Decoupling services (order placed → inventory updated → email sent)
- Handling traffic spikes (queue prevents DB overload)
- Reliable job processing (retry failed jobs)

**SQS / RabbitMQ / Kafka patterns:**

```typescript
// Producer: put job on queue
await sqs.sendMessage({
  QueueUrl: process.env.EMAIL_QUEUE,
  MessageBody: JSON.stringify({
    to: user.email,
    subject: 'Welcome',
    template: 'welcome',
  }),
});

// Consumer: process jobs
async function processEmail(message: SQS.Message) {
  const { to, subject, template } = JSON.parse(message.Body);
  await emailService.send({ to, subject, template });
  await sqs.deleteMessage({ QueueUrl: process.env.EMAIL_QUEUE, ReceiptHandle: message.ReceiptHandle });
}
```

**Dead letter queues (DLQ):** Every queue needs one. Failed jobs after N retries go to DLQ for manual inspection.

## Load Balancing

**Distribute load across instances:**

- **Round-robin:** Simple, even distribution. Good default.
- **Least connections:** Routes to instance with fewest active requests. Best for varied request durations.
- **IP hash:** Consistent routing for same client. Use when sticky sessions are needed.

**Health checks:** Every instance behind a load balancer must have a health endpoint:

```typescript
app.get('/health', (req, res) => {
  const dbHealthy = await db.ping();
  const redisHealthy = await redis.ping();
  if (dbHealthy && redisHealthy) {
    res.json({ status: 'ok', uptime: process.uptime() });
  } else {
    res.status(503).json({ status: 'degraded' });
  }
});
```

**Setup:** 2+ instances minimum for high availability. Health check removes unhealthy instances from rotation automatically.

## Microservices Patterns

**Only split into microservices when you have a specific reason:**
- Different scaling characteristics (CPU-heavy vs I/O-heavy)
- Different deployment frequencies
- Different team ownership
- Different technology requirements

**Start with a modular monolith.** Split later when needed.

**Service-to-service communication:**
- **Synchronous (HTTP/gRPC):** Request/response. Use when you need the response immediately.
- **Asynchronous (events):** Fire and forget via message queue. Use for decoupled, eventually-consistent operations.

**Event-driven architecture:**

```typescript
// Order service: publish event on order creation
await eventBus.publish('order.placed', {
  orderId: order.id,
  userId: order.userId,
  total: order.total,
  items: order.items,
});

// Inventory service: subscribe to event
eventBus.subscribe('order.placed', async (event) => {
  await inventoryService.reserve(event.items);
});

// Email service: subscribe to event
eventBus.subscribe('order.placed', async (event) => {
  await emailService.sendOrderConfirmation(event.orderId);
});
```

## Resiliency

**Circuit breaker pattern:**

```typescript
async function callService(fn: () => Promise<T>, options: { timeout: number; retries: number }) {
  for (let i = 0; i < options.retries; i++) {
    try {
      return await withTimeout(fn(), options.timeout);
    } catch (err) {
      if (i === options.retries - 1) throw err;
      await sleep(100 * Math.pow(2, i)); // exponential backoff
    }
  }
}
```

**Bulkhead isolation:** Separate thread pools for different services. Failure in one service doesn't exhaust the shared pool.

**Graceful degradation:** If a non-critical service fails, the main feature continues. Show cached data, disable non-essential features.

## Observability

**Three pillars:**

1. **Logs** — Structured JSON logs. Every request has a request ID.
2. **Metrics** — Request rate, error rate, latency percentiles (p50, p95, p99). Use Prometheus + Grafana.
3. **Traces** — Distributed request tracing. Use OpenTelemetry.

**Key metrics to track:**
- Request latency (p50, p95, p99)
- Error rate (5xx per minute)
- Saturation (CPU, memory, connection pool usage)
- Business metrics (orders per minute, signups, etc.)

**Alert on symptoms, not causes:**
- Alert: Error rate > 1% for 5 minutes
- Don't alert: Database CPU > 80% (this is a cause, not a symptom)

## CAP Theorem

**You can only guarantee 2 of 3:**
- **Consistency** — all nodes see the same data at the same time
- **Availability** — every request gets a response
- **Partition tolerance** — system works even when network fails between nodes

**Reality:** Network partitions will happen. Always choose between CP and AP.

- **CP systems:** Zookeeper, etcd, Consul — don't return stale data
- **AP systems:** Cassandra, DynamoDB, CouchDB — always available, may return stale data

**Choose based on your requirements.** Most web apps are AP (prefer availability). Financial systems are often CP (prefer consistency).

## Checklist

- [ ] Stateless application servers
- [ ] Horizontal scaling strategy defined
- [ ] Read replicas for read-heavy workloads
- [ ] CDN for static assets
- [ ] Caching strategy (cache-aside, TTL, invalidation)
- [ ] Database indexing strategy
- [ ] Health check endpoints
- [ ] Load balancer with health checks
- [ ] Graceful shutdown handling
- [ ] Dead letter queues
- [ ] Circuit breakers for external services
- [ ] Structured logging with request IDs
- [ ] Metrics and alerting
