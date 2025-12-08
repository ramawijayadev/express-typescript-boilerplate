# Convention Handbook

> Code Conventions & Project Standards

> **Document Purpose:** To make the codebase consistent, predictable, and serve as a mandatory reference for all developers (TypeScript + Express).

## Index
- [0. Legend](#0-legend)
- [1. Project Structure](#1-project-structure)
- [2. Naming System](#2-naming-system)
- [3. Module Structure](#3-module-structure)
- [4. File Suffixes](#4-file-suffixes)
- [5. HTTP & Routing](#5-http--routing)
- [6. Data & Types](#6-data--types)
- [7. Error Handling](#7-error-handling)
- [8. Import Style](#8-import-style)
- [9. Logging & Hygiene](#9-logging--hygiene)
- [10. Testing Conventions](#10-testing-conventions)
- [11. OpenAPI Documentation](#11-openapi-documentation)

## 0. Legend
- **[MANDATORY]** Must be followed in all new code. Violations may start compile errors or CI failures.
- **[RECOMMENDED]** Should be followed. Valid exceptions exist but are rare.
- **[OPTIONAL]** May be used if relevant.

## 1. Project Structure

### 1.1. Root structure **[MANDATORY]**
```bash
backend-starterkit/
  eslint.config.mjs   # Flat ESLint rules
  tsconfig.json       # TypeScript Strict Mode
  .env                # Local secrets (gitignored)
  src/                # Application source code
  docs/               # Single Source of Truth
```

### 1.2. Main structure in src/ **[MANDATORY]**
```bash
src/
  /app          # Bootstrap (server.ts, app.ts)
  /config       # Environment configuration
  /core         # Framework/Infra (http, logging, queue)
  /modules      # Feature Modules (Flatter structure)
  /shared       # Shared utilities (errors, types)
  /cli          # CLI Commands
  /jobs         # Job Workers
  /tests        # Global Tests (E2E, Perf)
```

### 1.3. Module Flattening **[MANDATORY]**
Modules are placed directly under `src/modules/`. We do **NOT** use nested categories like `platform` or `business` to prevent deep nesting fatigue.

```bash
src/modules/
  /auth         # Auth Module
  /users        # Users Module
  /health       # Health check
  /jobs         # Job related logic
```

## 2. Naming System

### 2.1. Files & Folders **[MANDATORY]**
Use **kebab-case**.
```typescript
src/modules/auth/auth.service.ts
src/core/http/middlewares/rate-limiters.ts
```

### 2.2. Identifiers **[MANDATORY]**
- `camelCase`: variables, functions, methods, instances.
- `PascalCase`: Classes, Types, Interfaces, Enums.
- `SCREAMING_SNAKE_CASE`: Global constants.

## 3. Module Structure

### 3.1. One Folder = One Module **[MANDATORY]**
Everything related to a feature stays inside that folder. No "scattering" code across the app.

### 3.2. Mandated Files **[MANDATORY]**
A typical module (e.g., `auth`) must contain:
- `auth.routes.ts`: Route definitions + OpenAPI Registry.
- `auth.controller.ts`: Request handling.
- `auth.service.ts`: Business logic.
- `auth.repository.ts`: Database interaction.
- `auth.schemas.ts`: Zod validation schemas.
- `auth.types.ts`: TypeScript interfaces/types.

## 4. File Suffixes
Every file must have a suffix denoting its architectural role.
- `*.model.ts` is **deprecated** (Use Prisma schema + Types).
- `*.utils.ts` is generic specific logic.
- `*.job.ts` for background job definitions.

## 5. HTTP & Routing Patterns

### 5.1. Type-Safe Handlers **[MANDATORY]**
Do NOT use raw `(req, res)` functions. You must use the type-safe wrappers to ensure body/query strict typing.

```typescript
// ❌ unsafe
authRouter.post('/login', (req, res) => ...);

// ✅ safe (infers types from LoginBody)
authRouter.post(
  '/login',
  typedHandler<LoginBody>((req, res) => controller.login(req, res))
);
```

### 5.2. Authenticated Handlers **[MANDATORY]**
For protected routes, use `authenticatedHandler` which ensures `req.user` is present.

```typescript
authRouter.post(
  '/revoke',
  authenticate,
  authenticatedHandler((req, res) => controller.revoke(req, res))
);
```

## 6. Data & Types

### 6.1. Zod First **[MANDATORY]**
All input (Body, Query, Params) MUST be validated by Zod schemas defined in `*.schemas.ts`.

### 6.2. Type Inference **[RECOMMENDED]**
Derive TypeScript types from Zod schemas to avoid duplication.
```typescript
export type RegisterBody = z.infer<typeof registerSchema>;
```

## 7. Error Handling

### 7.1. AppError **[MANDATORY]**
Use `AppError` for all operational errors.
```typescript
throw new AppError(StatusCodes.NOT_FOUND, "User not found");
```

### 7.2. Controller Response **[MANDATORY]**
Use the helper functions from `@/shared/http/api-response`.

```typescript
// 200 OK
return ok(res, data);
// { success: true, statusCode: 200, message: "OK", data: ..., requestId: "..." }

// 201 Created
return created(res, newUser);
```

## 8. Import Style

### 8.1. Path Alias (@/) **[MANDATORY]**
Always use `@/` for imports outside the current module.

```typescript
// ❌ Bad
import { logger } from '../../../core/logging/logger';

// ✅ Good
import { logger } from '@/core/logging/logger';
```

### 8.2. Import Order **[MANDATORY]**
Enforced by ESLint. Order: Builtin -> External -> Internal (@/) -> Relative.

## 9. Logging & Hygiene

### 9.1. No Console **[MANDATORY]**
`console.log` is forbidden by Linter. Use `pino` logger.

### 9.2. No Any **[MANDATORY]**
`no-explicit-any` is currently set to ERROR. Do not use `any`.

## 10. Testing Conventions

### 10.1. Co-location **[MANDATORY]**
Unit and Integration tests live INSIDE the module folder.
```bash
src/modules/auth/__tests__/
  auth.service.unit.spec.ts
  auth.routes.integration.spec.ts
```

### 10.2. Global Tests **[MANDATORY]**
E2E and Performance tests live in `src/tests/`.

## 11. OpenAPI Documentation

### 11.1. Code-First **[MANDATORY]**
Every route file must export an `OpenAPIRegistry`.

```typescript
export const authRegistry = new OpenAPIRegistry();

authRegistry.registerPath({
  method: 'post',
  path: '/auth/login',
  request: { ... },
  responses: ...
});
```

---
Convention Handbook — Internal Developer Reference
