# Project Setup Guide

Welcome to the Express TypeScript Boilerplate! This guide covers two ways to get up and running:

- **[Method A: Docker Setup](#method-a-docker-setup-zero-dependency)** (Recommended for "Clone & Run")
- **[Method B: Manual Setup](#method-b-manual--local-setup)** (Recommended for native performance or hybrid workflows)

---

## Method A: Docker Setup (Zero-Dependency)

This method ensures a consistent environment without requiring Node.js, PostgreSQL, or Redis installed on your machine.

### 1. Clone & Configure Environment

Clone the repository and create your local environment file:

```bash
cp .env.example .env
```

### 2. Generate Secrets

Run the following command to securely generate JWT secrets and update your `.env` file. This uses the container's environment, so you don't need Node.js locally.

```bash
pnpm docker:setup
# OR explicitly via docker-compose if you don't have pnpm installed:
# docker-compose run --rm app pnpm cli jwt:generate
```

### 3. Start the System

Start the entire application stack (App, Postgres, Redis, Mailpit). The container will automatically **migrate** the database and **seed** initial data on startup.

```bash
docker-compose up
```

Wait until you see the log: `Server running on port 3000`.

### 4. Verification

Your API is now accessible at `http://localhost:3333` (as mapped in `docker-compose.yml`).

- **Health Check**: [http://localhost:3333/api/v1/health](http://localhost:3333/api/v1/health)
- **API Docs (Swagger)**: [http://localhost:3333/docs](http://localhost:3333/docs)
- **Mailpit (Email Testing)**: [http://localhost:8025](http://localhost:8025)

---

## Method B: Manual / Local Setup

Use this method if you prefer running tools natively on your machine or need to debug specific services.

### Prerequisites

- **Node.js**: v22+
- **pnpm**: v9+ (or use `corepack enable pnpm`)
- **PostgreSQL**: v15+
- **Redis**: v7+

### 1. Installation

Install dependencies:

```bash
pnpm install
```

### 2. Configure Environment

Create your `.env` file and generate secrets:

```bash
cp .env.example .env
pnpm cli jwt:generate
```

### 3. Infrastructure

Ensure you have PostgreSQL and Redis running.

- **Option 1**: Use your system's installed services.
- **Option 2 (Hybrid)**: Use Docker just for infrastructure:
  ```bash
  docker-compose up -d postgres redis mailpit
  ```

> **Note**: If using local infrastructure, ensure your `.env` points to `localhost` (e.g., `REDIS_HOST=localhost`, `DATABASE_URL=postgresql://...localhost:5432...`).

### 4. Database Initialization

Run migrations and seed the database:

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Run Development Server

Start the application with hot-reloading:

```bash
pnpm dev
```

The server will start at `http://localhost:3000`.

---

## Troubleshooting

### Port Conflicts

If you see `EADDRINUSE`, check if another service is using the ports:

- **3333** (App Docker Port)
- **3000** (App Local Port)
- **5432** (Postgres)
- **6379** (Redis)

### Database Connection Errors

- **Docker**: Ensure `DATABASE_URL` uses the service name `postgres` (e.g., `postgres://user:pass@postgres:5432/...`).
- **Local**: Ensure `DATABASE_URL` uses `localhost` (e.g., `postgres://user:pass@localhost:5432/...`).

### Permission Issues (Docker)

If you encounter permission errors with `node_modules` on Linux, try removing the volume:

```bash
docker-compose down -v
```
