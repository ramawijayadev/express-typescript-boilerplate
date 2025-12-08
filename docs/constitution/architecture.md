# Architecture Handbook

> Technical architecture guide for building production-grade, scalable, and maintainable backend applications.

## Table of Contents

- [1. Purpose & Scope](#1-purpose--scope)
- [2. Mental Model](#2-mental-model)
- [3. Platform / Runtime Core](#3-platform--runtime-core)
- [4. Domain & API Layer](#4-domain--api-layer)
- [5. Data & Integration Layer](#5-data--integration-layer)
- [6. Security & Access Layer](#6-security--access-layer)
- [7. Communication Layer](#7-communication-layer)
- [8. Observability & Operations](#8-observability--operations)
- [9. Developer Experience & Quality](#9-developer-experience--quality)
- [10. Advanced Topics](#10-advanced-topics)
- [11. Summary](#11-summary)

## 1. Purpose & Scope

This document serves as the technical "North Star" to ensure that applications built are:

- **Production-grade:** Ready to serve real users, stable, and secure.
- **Scalable:** Relevant for small teams (MVP) up to large-scale operations.
- **Technology-agnostic:** Focused on structural concepts, not just specific frameworks.

## 2. Mental Model

The backend application is conceptualized as a combination of 7 primary layers:

1. **Platform / Runtime Core** (Foundation)
2. **Domain & API Layer** (Business Logic)
3. **Data & Integration Layer** (Storage & External)
4. **Security & Access Layer** (Safety)
5. **Communication Layer** (Protocol)
6. **Observability & Operations** (Monitoring)
7. **Developer Experience & Quality** (Tooling)

> Some aspects are **cross-cutting concerns** (such as Security, Logging, and Config) that permeate multiple layers, but their policies are defined in specific layers.

## 3. Platform / Runtime Core

The technical foundation layer. All requests rely on this component.

### 3.1. Config & Environment Management

**Principle:** Explicit Configuration.

- **Environment Variables:** Store secrets (DB URL, API Keys) in the environment, not in the code.
- **Schema Validation:** The application must fail to start if mandatory configuration is invalid.
- **Abstraction:** Use a single global configuration object (singleton) within the app.

**Implementation:** Uses Zod for environment variable validation in `src/app/env.ts`. Configurations are grouped modularly by domain in `src/config/` (app, auth, database, logging, mail, queue, swagger).

### 3.2. HTTP Server & Routing

Framework initialization and global routing. Ensure consistent URL structure (e.g., `/api/v1`) and split routing per feature module.

**Implementation:** The Express app is bootstrapped in `src/app/app.ts` with centralized routing in `src/core/http/router.ts`. All endpoints are mounted at `/api/v1`. Swagger UI is available at the root (`/`) for non-production environments.

### 3.3. Global Middlewares

Technical logic executed before business logic:

- Body parser, CORS, Security headers (Helmet).
- Request ID generator (for tracing).
- Rate limiter.

**Implementation:** The complete middleware stack is defined in `src/core/http/middlewares/index.ts`:

- **Helmet:** HTTP security headers with CSP policy (dynamic content allowed for Swagger UI).
- **CORS:** Origin configuration via env vars with credentials support.
- **HPP:** Protection against HTTP Parameter Pollution.
- **Rate Limiting:** Configurable window & max requests (disabled in test environments).
- **Body Size Limit:** 10kb limit to prevent DoS attacks.
- **Input Sanitization:** Custom middleware to prevent NoSQL/SQL injection.
- **Request ID:** UUID generation or propagation from `x-request-id` header.
- **Request Logger:** Structured logging for every HTTP request (method, path, status, duration).

### 3.4. Error Handling Strategy

Standardizing error representation to the client:

- **Error Model:** Standard JSON structure (`success`, `message`, `statusCode`, `errors` for validation, `requestId`).
- **Error Mapping:** Mapping error types to HTTP status codes (400, 404, 500) using the `AppError` class.
- **Global Handler:** Centralized catch-all for logging (separate from user response) and sanitization.

**Implementation:** The `AppError` class in `src/shared/errors/AppError.ts` handles operational errors. The global error handler in `src/core/http/error-handler.ts` handles AppError, ZodError (validation), and Prisma errors. Response helpers are located in `src/shared/http/api-response.ts` (ok, created, clientError, validationError, serverError).

### 3.5. Health Checks & Lifecycle

- **Liveness Probe:** Checks if the process is alive (for restart policies).
- **Readiness Probe:** Checks if the app is ready to accept traffic (stops traffic if DB is down).
- **Graceful Shutdown:** Stops new requests, finishes in-flight requests, and closes DB connections cleanly before termination.

**Implementation:** Endpoint `GET /api/v1/health` in `src/modules/health/health.routes.ts`. The response includes server status, version, timestamp, and job metrics (failed job count with alert threshold). Graceful shutdown in `src/app/server.ts` handles SIGINT/SIGTERM by closing the HTTP server, database connections, and background job workers.

## 4. Domain & API Layer

The layer containing Business Logic and HTTP Contracts. The code uses a **Flat Module Structure**.

### 4.1. Domain Entities / Models

Pure business concepts (User, Order) and their rules. Modules are located directly under `src/modules/` (e.g., `src/modules/auth`, `src/modules/users`) without nested categorical folders.

### 4.2. Service / Use Case Layer

Orchestrates business flow (Register, Checkout). Connects validation, repositories, and other logic.

### 4.3. Validation (Request & Domain)

- **Request Validation:** Checks input format (Zod/Joi Schema).
- **Domain Validation:** Checks business rules (e.g., Insufficient stock).

### 4.4. CRUD Patterns & Response

Standardization of Create, Read, Update, Delete operations:

- Consistent naming conventions.
- **Response Format:** Uniform success structure (`data`, `meta`, `moduleId`, `requestId`).

```json
// Success
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": { ... },
  "requestId": "..."
}
```

### 4.5. Routing, Controllers & DI

Controllers are strictly responsible for receiving input, calling services, and mapping results to HTTP responses. **Avoid business logic in controllers.**

**Dependency Injection:** We use **Manual Injection** in the `*.routes.ts` files. The Router instantiates the Controller, Service, and Repository, wiring them together explicitly. We avoid complex DI containers.

### 4.6. API Versioning

Use a versioning strategy (URL prefix `/v1/`) so that API evolution does not break existing clients.

## 5. Data & Integration Layer

### 5.1. Database & Repository Pattern

Use the **Repository Pattern** (via Prisma ORM) to isolate the domain from database query details, facilitating testing and maintenance.

**Implementation:** Prisma Client in `src/core/database/connection.ts` with the PostgreSQL adapter (`@prisma/adapter-pg`) for serverless compatibility. The schema in `prisma/schema.prisma` includes User, UserSession, PasswordResetToken, EmailVerificationToken, and Example models. The repository pattern is consistent across all modules (e.g., `auth.repository.ts`, `users.repository.ts`).

### 5.2. Caching Strategy

Reducing data latency (Redis). Define clear **TTL** and **Invalidation** strategies when data changes.

**Status:** Redis client (ioredis) is available and used for the queue infrastructure. A caching layer has not yet been explicitly implemented.

### 5.3. Async Jobs (Message Queue)

Handling heavy processes (email, reports) in the background using a Queue (BullMQ/Redis) and separate Worker processes.

**Implementation:** BullMQ queue system in `src/core/queue/index.ts` featuring:

- **Email Queue:** Dedicated queue for email jobs (verification, password reset).
- **Dead Letter Queue (DLQ)::** Separate queue for failed jobs after retries are exhausted.
- **Worker:** Background worker in `src/jobs/index.ts` with concurrency set to 5.
- **Job Handlers:** Send email (`send-email.job.ts`), cleanup old failed jobs (`cleanup-failed-jobs.job.ts`).
- **Retry Policy:** Configurable attempts with automatic DLQ migration.
- **Job Management API:** Admin endpoints at `/api/v1/jobs` to list, retry, remove, and cleanup failed jobs.
- **Health Monitoring:** Job metrics included in the health check endpoint with alert thresholds.

### 5.4. File & Object Storage

Store binary files (images, documents) in Object Storage (S3/MinIO), not in the database. The database only stores the URL/Key.

**Status:** Storage abstraction layer is available in `src/core/storage/index.ts`, but concrete implementations for S3/local storage and file upload endpoints are pending.

### 5.5. Search Engine Integration

If complex search features are required (Full-text search), sync data to a dedicated search engine (Elasticsearch/MeiliSearch).

**Status:** Not yet implemented.

### 5.6. External API Clients

Wrappers for third-party services (Payment, SMS). Focus on handling **Timeouts** and **Retry** strategies.

**Status:** Axios is available as an HTTP client, but specific wrappers for external APIs are not yet created.

## 6. Security & Access Layer

### 6.1. Authentication

User identification (JWT, Session, OAuth). Ensure secure token validation mechanisms.

**Implementation:** Dual-token JWT system in `src/modules/auth/`:

- **Access Token:** Short-lived JWT (configurable expiry) for authorization.
- **Refresh Token:** Long-lived hashed token stored in the database (UserSession table).
- **Token Rotation:** Refresh tokens are hashed and rotated upon every refresh for security.
- **Session Management:** Tracking user agent, IP address, and last used timestamp.
- **Account Locking:** Failed login tracking with automatic account lock after a threshold.
- **Email Verification:** Token-based with expiry.
- **Password Reset Flow:** Secure token generation and validation.

### 6.2. Authorization

Access control (RBAC/Permission-based). Determining "who is allowed to do what" on specific resources.

**Status:** Authentication middleware (`authenticate.middleware.ts`) is available to verify JWTs and attach the user to the request context. RBAC/permission systems are not yet implemented.

### 6.3. Security Hardening

Implementation of additional defense layers: Rate Limiter, Input Sanitization (XSS/SQLi), strict CORS policy, and Brute-force protection.

**Implementation:** Comprehensive security middleware stack (see section 3.3). Password hashing uses **Argon2** (more secure than bcrypt). Timing-safe comparisons for token validation.

### 6.4. Secrets Management

Management of encryption and keys. **Never commit secrets to the repo.** Use a Secret Manager or encrypted Env Vars.

**Implementation:** All secrets via environment variables with validation via Zod schema. JWT secrets, database URLs, Redis credentials, and SMTP credentials managed via `.env` (gitignored). `.env.example` is provided as a template.

### 6.5. Audit Log

Recording critical activity trails ("Who", "Did What", "When") for forensics, security, and compliance.

**Status:** Not yet implemented. Structured logging is available, but there is no dedicated audit log table or tracking for sensitive operations.

## 7. Communication Layer

- **HTTP REST/GraphQL:** Standard request-response communication.
- **Real-Time (WebSocket/SSE):** For live notifications or chat.
- **Event-Driven (Pub/Sub):** Integrations between modules that are _loosely-coupled_ via an event bus.

## 8. Observability & Operations

### 8.1. Structured Logging

Logs in JSON format. Must include context (RequestId, UserId) and appropriate Log Levels.

**Implementation:** Pino logger in `src/core/logging/logger.ts` featuring:

- **JSON Output:** Structured logging for easy parsing (production).
- **Pretty Print:** Human-readable format for development (pino-pretty).
- **Request Correlation:** Automatic request ID attachment to every log entry.
- **Context Enrichment:** Support for adding contextual data (userId, path, etc.).
- **Log Rotation:** Pino-roll configured for daily rotation and retention policy.
- **Log Levels:** debug, info, warn, error properly utilized throughout the codebase.

### 8.2. Metrics & Monitoring

Monitoring system health: Throughput (RPS), Latency (p95, p99), Error Rate, and Resource Usage.

**Implementation:** Metrics initialization in `src/core/observability/metrics.ts` (called during server bootstrap). Infrastructure is ready for metrics collection.

### 8.3. Tracing

Using `TraceId` / `CorrelationId` to track the request journey across various system components.

**Implementation:** Request ID middleware generates a UUID for every request. Tracing initialization in `src/core/observability/tracing.ts`. IDs are propagated via HTTP headers (`x-request-id`) and included in all log entries and API responses.

### 8.4. Alerting Hooks

Automatic notifications (Slack/PagerDuty) when critical metrics (Error rate, Latency) exceed reasonable thresholds.

**Status:** Health check endpoint provides job metrics with alert thresholds, but integration with external alerting systems is not yet implemented.

## 9. Developer Experience & Quality

### 9.1. Automated Testing Strategy

Testing pyramid to ensure quality:

- **Unit Test:** Smallest logic isolated.
- **Integration Test:** Interaction between modules/DB.
- **E2E Test (API Flow):** Full user scenarios from start to finish.
- **Load/Stress Test (k6):** Performance and load resilience testing.

**Implementation:** Vitest as the test runner in `src/tests/`:

- **Vitest:** Modern test runner with Vite-native compilation (faster than Jest).
- **Supertest:** HTTP assertion library for integration testing.
- **Test Organization:** Feature-based with `__tests__` folders in every module.
- **Naming Convention:** `*.unit.spec.ts`, `*.integration.spec.ts`, `*.e2e.spec.ts`.
- **Setup:** Global test setup in `src/tests/setup.ts` for database connection and cleanup.
- **Coverage:** Auth flow, user journey, API response format, error handling.

### 9.2. Documentation

OpenAPI/Swagger that is **generated from code** (via zod-to-openapi) serving as the contract (Single Source of Truth) with Frontend/Client.

**Implementation:** Code-first OpenAPI documentation:

- **@asteasolutions/zod-to-openapi:** Generates spec from Zod schemas.
- **Registry Pattern:** Each route file exports an OpenAPIRegistry with path definitions.
- **Swagger UI:** Mounted at the root (`/`) for non-production environments.
- **Config:** Swagger spec generator in `src/config/swagger.ts`.
- **Auto-sync:** Documentation is always in sync with validation schemas.

### 9.3. Code Quality & Standards

Automated Linter (ESLint) and Formatter (Prettier) via **Git Hooks** (Husky) for consistent code standards.

**Implementation:** ESLint + Prettier with TypeScript support. Husky + lint-staged configured for pre-commit hooks. Import sorting, no unused vars, and consistent naming enforced.

### 9.4. CI Pipeline & Local Dev

- **CI Pipeline:** Automatically runs tests and linting before merge.
- **Local Environment:** Easy and standardized local development setup using **Docker**.

**Implementation:** Docker Compose setup in `docker-compose.yml` for PostgreSQL and Redis. Development workflow with `pnpm dev` for hot reload via nodemon + tsx. Scripts are available for db migration, testing, and linting.

## 10. Advanced Topics

Development references for larger scales:

- **Performance Strategy:** Aggressive caching, stateless scaling.
- **Data Lifecycle:** Data retention and backup policies.
- **Multi-Tenancy:** Data isolation for SaaS B2B applications.
- **Feature Flags:** Incremental feature releases without redeployment.
- **CQRS:** Separation of read and write models for high performance.
- **ADR (Architectural Decision Records):** Historical documentation of technical decisions.
- **Operational Playbook:** Standard checklists for handling production incidents.

## 11. Summary

A **production-grade** backend application is an orchestration of all the layers above. This document serves as a conceptual map to ensure code implementation remains directed, consistent, and of high quality.
