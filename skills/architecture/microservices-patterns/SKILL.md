---
name: microservices-patterns
description: Microservices architecture patterns including service decomposition, inter-service communication, data management, observability, and deployment strategies.
category: architecture
---

# Microservices Patterns

## Service Decomposition
- **Domain-driven design**: Bounded contexts as service boundaries
- **Business capability**: Each service maps to a business function (orders, payments, inventory)
- **Subdomain**: Core, supporting, and generic subdomains determine service criticality
- **Sizing**: A service should be small enough to be owned by a single team (2-8 people)

## Inter-Service Communication
- **Synchronous**: gRPC for low-latency internal calls, REST for external
- **Asynchronous**: Events via Kafka/RabbitMQ/NATS for loose coupling
- **API Gateway**: Single entry point for clients — handles auth, routing, rate limiting
- **Service mesh**: Sidecar proxy (Istio, Linkerd) for traffic management, observability, security

## Data Management
- **Database per service**: Each service owns its data store, no shared databases
- **Saga pattern**: Choreography (events) or orchestration (coordinator) for distributed transactions
- **API Composition**: Aggregate data from multiple services for read operations
- **CQRS**: Separate commands (writes) from queries (reads) for optimized data access

## Observability (Three Pillars)
- **Logging**: Structured JSON logs with correlation IDs across services
- **Metrics**: RED metrics (Rate, Errors, Duration) for every service endpoint
- **Tracing**: Distributed tracing (OpenTelemetry, Jaeger) to follow requests across services

## Deployment & CI/CD
- **Containerization**: Docker for consistent environments
- **Orchestration**: Kubernetes for deployment, scaling, and management
- **CI/CD**: Each service builds and deploys independently
- **Blue-green / Canary**: Zero-downtime deployments with rollback capability

## Resilience Patterns
- **Circuit breaker**: Fail fast when downstream service is unhealthy
- **Bulkhead**: Isolate resources so one failure doesn't cascade
- **Retry with backoff**: Exponential backoff + jitter for transient failures
- **Timeout**: Always set timeouts on inter-service calls
- **Health checks**: Liveness (is it alive?) and readiness (can it serve traffic?)

## Anti-Patterns to Avoid
- Distributed monolith (services that require coordinated deployment)
- Shared database across services
- Too-small services (nanoservices causing overhead)
- Synchronous chains (A → B → C → D blocking call chain)
