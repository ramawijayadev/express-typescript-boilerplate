# Dependency Handbook

> Standardized Package & Tooling Guide

> **Document Purpose:** Defines the standard technology stack (Node.js, Express, PostgreSQL, Prisma, Redis) to ensure consistency, performance, and ease of maintenance across the entire project. This document serves as the **Single Source of Truth** for all installed packages.

## Table of Contents
- [0. Legend](#0-legend)
- [1. Core Runtime & Config](#1-core-runtime--config)
- [2. HTTP & API Machinery](#2-http--api-machinery)
- [3. Security & Hardening](#3-security--hardening)
- [4. Authentication & Crypto](#4-authentication--crypto)
- [5. Database & Migrations](#5-database--migrations)
- [6. Cache & Queue](#6-cache--queue)
- [7. Logging & Observability](#7-logging--observability)
- [8. Utilities & Helpers](#8-utilities--helpers)
- [9. Command Line Interface](#9-command-line-interface)
- [10. API Documentation](#10-api-documentation)
- [11. Testing & QA](#11-testing--qa)
- [12. Developer Experience](#12-developer-experience-dx)
- [13. Build & Compiler](#13-build--compiler)
- [14. External Infra](#14-external-infra-non-npm)

## 0. Legend
- **[CORE]** **Mandatory.** Application will not run or will violate architecture standards without this.
- **[RECOMMENDED]** **Highly Suggested.** "Production Ready" standard. Can be replaced only if there is a very strong reason.
- **[OPTIONAL]** **Optional.** Use only if the specific feature is required.
- **[DEV]** **Development.** Only needed for local dev, testing, or building.

## 1. Core Runtime & Config

**express** **[CORE]**
Minimalist web framework for routing and middleware. The backbone of the application.

**zod** **[CORE]**
TypeScript-first schema validation. Mandatory for validating environment variables (`env.ts`), request bodies, and database inputs.

**dotenv** **[CORE]**
Loads environment variables from a `.env` file into `process.env`. Critical for configuration management.

## 2. HTTP & API Machinery

**cookie-parser** **[RECOMMENDED]**
Parse Cookie header and populate `req.cookies` with an object keyed by the cookie names.

**axios** **[RECOMMENDED]**
Promise-based HTTP Client for making external API requests (outbound calls).

**socket.io** **[OPTIONAL]**
Enables real-time, bidirectional, and event-based communication. Use only for websocket features.

## 3. Security & Hardening

**helmet** **[CORE]**
Helps secure Express apps by setting various HTTP headers (security defaults).

**cors** **[CORE]**
Provides a Connect/Express middleware that can be used to enable Cross-Origin Resource Sharing with various options.

**express-rate-limit** **[RECOMMENDED]**
Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs (brute-force protection).

**hpp** **[RECOMMENDED]**
Protection against HTTP Parameter Pollution attacks.

## 4. Authentication & Crypto

**jsonwebtoken** **[CORE]**
Implementation of JSON Web Tokens (standard). Used for creating and verifying access/refresh tokens.

**argon2** **[CORE]**
Secure password hashing algorithm. Winner of the Password Hashing Competition. Superior to bcrypt.

## 5. Database & Migrations

**@prisma/client** **[CORE]**
Auto-generated, type-safe query builder for Node.js & TypeScript.

**pg** **[CORE]**
Non-blocking PostgreSQL client for Node.js (native driver).

**@prisma/adapter-pg** **[CORE]**
Driver adapter to use the `pg` driver with Prisma, enabling serverless/edge compatibility if needed.

**prisma** **[DEV]**
CLI for managing your database schema, migrations, and generating the client.

## 6. Cache & Queue

**ioredis** **[CORE]**
A robust, performance-focused, and full-featured Redis client for Node.js.

**bullmq** **[RECOMMENDED]**
Message Queue based on Redis. Used for handling asynchronous background jobs (email, data processing).

## 7. Logging & Observability

**pino** **[CORE]**
Very low overhead Node.js logger. Outputs structured JSON logs mandatory for production.

**pino-roll** **[CORE]**
Transport for pino that implements log rotation (file management based on size/date).

**pino-pretty** **[DEV]**
Basic beautifier for Pino logs. Used only in development for readable console output.

## 8. Utilities & Helpers

**uuid** **[RECOMMENDED]**
For the generation of RFC4122 UUIDs (mostly v4). Used for Request IDs and non-DB IDs.

**http-status-codes** **[RECOMMENDED]**
Constants enumerating the HTTP status codes. Prevents magic numbers (e.g., using `StatusCodes.OK` instead of `200`).

**nodemailer** **[RECOMMENDED]**
Send emails from Node.js – easy as cake! Used for transactional emails.

## 9. Command Line Interface

**commander** **[RECOMMENDED]**
The complete solution for Node.js command-line interfaces. Used for the internal project CLI (`pnpm cli`).

## 10. API Documentation

**@asteasolutions/zod-to-openapi** **[CORE]**
Generates OpenAPI (Swagger) definitions from Zod schemas. Ensures code-first documentation source of truth.

**swagger-ui-express** **[RECOMMENDED]**
Serve auto-generated Swagger UI generated API docs from express. The visual frontend for docs.

**swagger-jsdoc** **[OPTIONAL]**
Generates openapi specification based on JSDoc comments. Kept for legacy support or specific edge cases.

## 11. Testing & QA

**vitest** **[CORE]** (Dev)
Blazing fast unit test framework. The replacement for Jest.

**supertest** **[RECOMMENDED]** (Dev)
High-level abstraction for testing HTTP, used for E2E testing.

## 12. Developer Experience (DX)
Everything related to Code Quality and Linting.

**eslint** **[CORE]** (Dev)
Pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript.

**prettier** **[CORE]** (Dev)
Opinionated code formatter. Ensures consistent style.

**husky** **[RECOMMENDED]** (Dev)
Modern native Git hooks made easy. Prevents bad git commit/push.

**lint-staged** **[RECOMMENDED]** (Dev)
Run linters against staged git files and don't let 💩 slip into your code base.

**nodemon** **[DEV]**
Simple monitor script for use during development of a Node.js app (auto-restart).

## 13. Build & Compiler

**typescript** **[CORE]** (Dev)
Language for application scale JavaScript.

**tsx** **[CORE]** (Dev)
TypeScript Execute (tsx): Node.js enhanced to run TypeScript files (replaced ts-node).

**tsc-alias** **[RECOMMENDED]** (Dev)
Replace alias paths with relative paths after typescript compilation (fix for `@/` imports).

**rimraf** **[DEV]**
The UNIX command `rm -rf` for node. Cross-platform folder deletion.

**concurrently** **[DEV]**
Run multiple commands concurrently. Helpful for starting multiple watchers.

**cross-env** **[DEV]**
Run scripts that set and use environment variables across platforms.

## 14. External Infra (Non-NPM)
The following tools are required in the environment but not listed in package.json.

**Docker & Docker Compose**
Containerization platform. Required for spinning up Postgres and Redis locally.

**Action Runner**
CI/CD Environment (e.g. GitHub Actions) for running automated tests.

---
Dependency Handbook — Internal Developer Reference
