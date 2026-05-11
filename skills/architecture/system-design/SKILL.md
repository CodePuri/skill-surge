---
name: system-design
description: System design patterns including architectural trade-offs, scalability strategies, communication patterns, and data flow design for distributed systems.
category: architecture
---

# System Design

## Key Principles
- **Separation of concerns**: Each service/module owns its data and logic
- **Single responsibility**: A component should have one reason to change
- **Dependency inversion**: Depend on abstractions, not concretions
- **Fail gracefully**: Design for failure, degrade gracefully under load

## Architecture Patterns
- **Monolith**: Simple, single deploy unit — good for small teams, early-stage products
- **Modular monolith**: Domain boundaries within a single deploy unit — good middle ground
- **Microservices**: Independent services, each with own data store — for large teams, independent scaling
- **Event-driven**: Services communicate via events (Kafka, RabbitMQ) — for loose coupling
- **Serverless**: Functions as compute units — for event-driven, bursty workloads

## Scalability Strategies
- **Horizontal scaling**: Add more instances behind a load balancer
- **Vertical scaling**: Increase instance size (simpler but has limits)
- **Caching**: Cache computed results and database queries (CDN, Redis, in-memory)
- **Read replicas**: Separate read traffic from write traffic on databases
- **Sharding**: Distribute data across multiple database instances by key

## Communication Patterns
- **REST**: Simple, stateless, great for CRUD — use for external APIs
- **gRPC**: Typed, streaming, high-performance — use for internal service-to-service
- **Message queues**: Decouple producers and consumers — use for async processing
- **WebSocket**: Bidirectional, real-time — use for live updates, chat, collaboration

## Data Flow Design
- **CQRS**: Separate read and write models — use when reads and writes have different shapes
- **Event sourcing**: Store events as the source of truth — use for auditing, temporal queries
- **Saga pattern**: Distributed transactions via compensating actions — for multi-service operations

## Caching Strategy
- **CDN**: Cache static assets at edge locations
- **Redis/Memcached**: Cache database queries, session data, API responses
- **Local cache**: In-process cache for hot data (with TTL and eviction)
- **Cache aside**: Application checks cache first, falls back to database
- **Write-through**: Cache is updated on every write
