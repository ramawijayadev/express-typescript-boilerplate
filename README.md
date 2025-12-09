![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)

# Express TypeScript Boilerplate

A production-ready, highly opinionated boilerplate for building scalable REST APIs with Node.js, TypeScript, and Docker.

Designed with **Clean Architecture** principles, this starter kit strictly enforces separation of concerns, strict type safety, and developer experience (DX). It comes pre-configured with a robust stack including PostgreSQL, Redis, BullMQ, and a comprehensive testing suite.

## Key Features

- **Strict Type Safety**: End-to-end type safety with TypeScript and Zod.
- **Clean Architecture**: Modular structure separating core logic from framework details.
- **Authentication**: Dual-token JWT system (Access & Refresh tokens) with rotation and blocking strategies.
- **Background Jobs**: Asynchronous processing using BullMQ and Redis.
- **Validation**: Runtime request validation using Zod.
- **Documentation**: Auto-generated OpenAPI (Swagger) documentation.
- **Testing**: Complete testing pyramid with Vitest (Unit), Supertest (Integration), E2E, and k6 (Performance).
- **Security**: Hardened configs for Helmet, Rate Limiting, and safe secrets management.
- **Developer Experience**: "Clone & Run" support via Docker, hot-reloading, and unified scripts.

## Tech Stack

- **Runtime**: Node.js v22+
- **Language**: TypeScript v5+
- **Framework**: Express v5
- **Database**: PostgreSQL v15+, Prisma ORM
- **Cache/Queue**: Redis v7, BullMQ
- **Logging**: Pino
- **Testing**: Vitest, Supertest, k6
- **Package Manager**: pnpm

## Prerequisites

- **Docker & Docker Compose** (Recommended for easiest setup)
- **Node.js** v22+ (For local development)
- **pnpm** v9+

## Getting Started

### 🚀 Option 1: Docker (Recommended)

The easiest way to start. No local Node.js or Database required.

1.  **Clone & Configure**:

    ```bash
    git clone <repo-url>
    cd express-typescript-boilerplate
    cp .env.example .env
    ```

2.  **Generate Secrets**:

    ```bash
    # Uses the container to generate secure JWT secrets
    pnpm docker:setup
    ```

3.  **Start System**:
    ```bash
    docker-compose up
    ```
    The app will start at `http://localhost:3333`. The database will be automatically migrated and seeded.

### 🛠️ Option 2: Manual Setup

For developers who prefer running tools natively without Docker for the application itself.

1.  **Configure Environment**:
    Create configuration files for both development and testing.

    ```bash
    cp .env.example .env
    cp .env.example .env.test
    ```

    **Update `.env` (Development):**
    - `NODE_ENV=development` (Enables Swagger UI)
    - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/express_boilerplate?schema=public"`
    - `REDIS_HOST=localhost`
    - `SMTP_HOST=localhost`
    - `TEST_MAILPIT_URL=http://localhost:8025`

    **Update `.env.test` (Testing):**
    - `NODE_ENV=test`
    - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/express_boilerplate_test?schema=public"`
    - `REDIS_HOST=localhost`
    - `SMTP_HOST=localhost`

2.  **Install Dependencies**:

    ```bash
    pnpm install
    ```

3.  **Fresh Start (Recommended)**:
    Since you are starting a fresh project, it is best to remove the boilerplate's existing migration history to avoid conflicts.

    ```bash
    rm -rf prisma/migrations
    ```

4.  **Initialize Development Database**:
    This sequence ensures a completely clean state (`db:reset`), creates *your* first migration (`db:migrate`), and populates data (`db:seed`).

    ```bash
    pnpm db:reset
    pnpm db:migrate
    pnpm db:seed
    ```

5.  **Setup Test Database**:
    Create a separate database for testing and clone the schema from your main development database.

    ```bash
    # Create the test database
    createdb -U postgres express_boilerplate_test

    # Clone the schema (structure only) from the main DB
    pg_dump -s -U postgres express_boilerplate | psql -U postgres express_boilerplate_test
    ```

6.  **Generate Secrets**:

    ```bash
    pnpm cli jwt:generate
    ```

7.  **Run Development Server**:
    Ensure PostgreSQL, Redis, and Mailpit are running locally before starting.

    ```bash
    pnpm dev
    ```

## Environment Variables

Key variables found in `.env`:

| Variable             | Description                         | Default                  |
| :------------------- | :---------------------------------- | :----------------------- |
| `NODE_ENV`           | Environment mode                    | `production`             |
| `APP_PORT`           | Application port                    | `3000`                   |
| `DATABASE_URL`       | Prisma DB Connection URL            | `postgresql://...`       |
| `REDIS_HOST`         | Redis Hostname                      | `redis` (or `localhost`) |
| `JWT_SECRET`         | Secret for signing Access Tokens    | _Generated_              |
| `JWT_REFRESH_SECRET` | Secret for verifying Refresh Tokens | _Generated_              |
| `LOG_LEVEL`          | Logging verbosity                   | `info`                   |

See `.env.example` for the full list.

## Project Structure

```text
src/
├── app/            # Application bootstrap & server setup
├── cli/            # Custom CLI commands (jwt:generate, etc.)
├── config/         # Centralized configuration (Auth, DB, Logging)
├── core/           # Framework-agnostic core logic
├── jobs/           # Background job definitions and workers
├── modules/        # Feature modules (Clean Architecture)
│   ├── auth/       # Authentication logic
│   ├── users/      # User management
│   └── ...
├── shared/         # Shared utilities, types, and constants
└── tests/          # Test suites
    ├── e2e/        # End-to-End tests
    ├── perf/       # k6 Performance tests
    └── setup.ts    # Global test setup
```

## Scripts

| Script              | Description                           |
| :------------------ | :------------------------------------ |
| `pnpm dev`          | Start dev server with hot-reloading   |
| `pnpm build`        | Compile TypeScript to `dist/`         |
| `pnpm start`        | Run the compiled production app       |
| `pnpm test`         | Run all Unit and Integration tests    |
| `pnpm test:e2e`     | Run End-to-End tests                  |
| `pnpm db:migrate`   | Run database migrations               |
| `pnpm db:seed`      | Seed the database with sample data    |
| `pnpm docker:setup` | Helper to generate secrets via Docker |

## Testing

We employ a comprehensive testing strategy:

- **Unit/Integration**: Powered by Vitest.
  ```bash
  pnpm test
  ```
- **End-to-End (E2E)**: Tests full user journeys.
  ```bash
  pnpm test:e2e
  ```
- **Performance**: Load testing with k6 (see `src/tests/perf/`).

## 📚 Documentation

We maintain a strict set of living documentation to ensure code quality, consistency, and security.

### 🚀 Start Here

- **[📖 Overview & Master Guide](docs/overview.md)** - The entry point to all technical standards.
- **[🛠️ Setup Guide](docs/setup.md)** - Detailed installation instructions (Docker & Local).
- **API Documentation** - Available at `/` (Swagger UI) when the server is running.

### 🛡️ Quality & Security

- **[🛡️ Audit Reports](docs/audit/security-audit-report.md)** - Comprehensive Security, Architecture, and Production Readiness assessments.

### 📘 Core Handbooks (The Constitution)

- [🏛️ Architecture Handbook](docs/constitution/architecture.md) - Mental model, layers, and separation of concerns.
- [⚖️ Convention Handbook](docs/constitution/convention.md) - Naming, folder structure, and file patterns.
- [🧼 Clean Code Handbook](docs/constitution/clean-code.md) - TypeScript standards and best practices.
- [📦 Dependency Handbook](docs/constitution/dependency.md) - Approved libraries and tools.
- [🧩 Feature Handbook](docs/constitution/feature.md) - Guide to core modules and features.

### 👥 Credits

**Express TypeScript Boilerplate** is proudly built and maintained by:

- **Rama Wijaya** - _Initial Work & Architecture_ - [@ramawijayadev](https://github.com/ramawijayadev)

### 📄 License

This project is open-sourced software licensed under the **[ISC License](LICENSE)**.

You are free to use, modify, and distribute this software as long as the copyright header is left intact.
