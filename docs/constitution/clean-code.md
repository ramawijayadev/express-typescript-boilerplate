# Clean Code Constitution

> Strict coding standards and conventions for TypeScript development.

> **Context:** Feature-Based Architecture (Controller-Service-Repository).<br>
> **Enforcement:** **Draconian / CI-Gated**. Violations will cause build failures.

## Index

- [1. The Core Narrative](#1-the-core-narrative)
- [2. Implementation Pattern](#2-implementation-pattern)
- [3. Primary Directives](#3-primary-directives)
- [4. Edge Case Protocols](#4-edge-case-protocols)
- [5. Modern Syntax & Style](#5-modern-syntax--style)

## 1. The Core Narrative

**Definition:** Clean Code in this project is defined by Predictability and Type Integrity.

1. **Type Safety is Documentation:** Do not write comments explaining _what_ a variable is. Define a Type/Interface that makes it self-evident.
2. **The "Sterile Zone" Principle:** The application core (Service/Repository) is a sterile environment. Data from the outside world (HTTP requests) must be sanitized, validated, and typed immediately upon entry (at the Controller level).
3. **Honesty:** The code must be honest about its state. We do not hide errors, and we do not lie about types using `any`.

## 2. Implementation Pattern

The codebase follows a strict **Feature-Based Module** pattern nested under `src/modules`.

```bash
src/modules/<feature>/
├── <feature>.controller.ts  // Gatekeeper: Validate (Zod) -> Call Service
├── <feature>.service.ts     // Brain: Pure Logic, DTO in/out, No HTTP objects
├── <feature>.repository.ts  // Storage: DB interaction, Returns Entities
├── <feature>.routes.ts      // Router: Route definitions & Middleware
├── <feature>.schemas.ts     // Contracts: Zod Schemas
└── <feature>.types.ts       // Contracts: TypeScript Interfaces
```

## 3. The Primary Directives

### A. The "Zero Any" Policy 🚫

The usage of `any` defeats the purpose of TypeScript. It is banned in all forms.

- **[FORBIDDEN]** **Explicit Any:** `const x: any`.
- **[FORBIDDEN]** **Stealth Any:**
  - `z.any()` in Zod Schemas (Use `z.unknown()`).
  - `Record<string, any>` (Use `Record<string, unknown>`).
  - `JSON.parse()` without immediate Zod validation/Type Guard.
- **[FORBIDDEN]** **Silencers:** `// @ts-ignore` or `eslint-disable` (Unless strictly justified with a comment).

### B. Observability & Logging 🔇

- **[FORBIDDEN]** **Console Log:** Usage of `console.log`, `console.error`, or `console.warn` in source code.
- **[REQUIRED]** **Logger Service:** Use the standardized **Pino Logger** (`@/core/logging/logger`).
- **[REQUIRED]** **Structured Logs:** Logs must be structured objects, not random strings, to facilitate observability.

### C. Input Validation (The Border Patrol) 🛡️

- **[REQUIRED]** **Zod Validation:** All external inputs (API bodies, params) must be validated using **Zod** schemas at the Controller/Route level.
- **[REQUIRED]** **Safe Typed Request:** Use `TypedRequest<Params, Res, Body, Query>` wrappers or Express Generics instead of raw `Request`.

### D. Testing Standards 🧪

- **[REQUIRED]** **Silence:** Tests must not output logs to the console. Mock the Logger.
- **[FORBIDDEN]** **Loose Mocks:** Do not mock data using `as any`. Define partial interfaces or use test data builders.
- **[REQUIRED]** **Strict Assertions:** Use `expect(obj).toEqual(...)` over `toBeTruthy()` to prevent false positives.

## 4. Edge Case Protocols

### Protocol 1: Handling Dynamic Objects

If an object has dynamic keys but consistent values, use `Record` with unknown.

```typescript
const config: Record<string, unknown> = { ... }
```

### Protocol 2: The "Safety Harness" (3rd Party Libraries)

If an external library returns `any`, establish a "Casting Boundary" immediately in a dedicated adapter or type file.

```typescript
// Allowed ONLY in adapter/type files:
const result = library.getData() as unknown as ExpectedType;
```

### Protocol 3: Array Access Safety

Assume array access can always be undefined (TSConfig `noUncheckedIndexedAccess` is ON).

```typescript
const user = users[0]; // Type is User | undefined
if (!user) throw new AppError(404, "User not found");
```

## 5. Modern Syntax & Style

- **Null Checks:** Use Optional Chaining (`?.`) and Nullish Coalescing (`??`).
- **Immutability:** Prefer spread operator (`...`) over mutation.
- **Imports:** Sort imports automatically. No empty lines inside import groups.
- **Async:** No floating promises. Always `await` or return.

---

Clean Code Constitution — Internal Developer Reference
