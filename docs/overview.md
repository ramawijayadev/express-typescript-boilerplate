# Backend Starter Kit

> The master documentation, technical standards, and development philosophy for production-grade backend applications.

This is your **Entry Point**. This starter kit is engineered to strike a balance between **Development Speed** (MVP) and **Long-term Stability** (Scalability).

## The Documentation Pillars

The ecosystem is built upon these core handbooks found in the `docs/constitution/` directory:

### 🏛️ 1. Architecture Handbook
The "Mental Map" of how the system works conceptually.
- **Mental Model:** 7 Layers (Platform, Domain, Data, Security, etc).
- **Decoupling:** Strict separation of Controller vs Service vs Repository.
- **Observability:** Logging & Tracing strategies from day one.
- **Philosophy:** Production-grade & Framework Agnostic.

[Open Architecture.md →](constitution/architecture.md)

### ⚖️ 2. Convention Handbook
The "Law" and ground rules ensuring code consistency and predictability.
- **Structure:** Feature-based folder structure (Colocation).
- **Naming:** Kebab-case files, PascalCase classes.
- **Routing:** Plural nouns, standard CRUD verbs.
- **Testing:** Placing tests inside modules (`__tests__`).

[Open Convention.md →](constitution/convention.md)

### 🧼 3. Clean Code Handbook
Strict TypeScript standards enforced via CI/CD.
- **Zero Any Policy:** Strict typing enforcement.
- **Input Validation:** Zod at the gates.
- **Observability:** No `console.log` allowed.
- **Modern Syntax:** Immutability and async/await best practices.

[Open Clean-Code.md →](constitution/clean-code.md)

### 📦 4. Dependency Handbook
The "Toolbox". Technologies that are Stable, Typed, and Mainstream.

**[Node.js]** **[Express]** **[TypeScript]** **[PostgreSQL]** **[Prisma]** **[Redis]** **[Vitest]** **[Zod]** **[Pino]**

Defines which libraries are **CORE** (Mandatory) and which are **RECOMMENDED**.

[Open Dependency.md →](constitution/dependency.md)

### 🧩 5. Feature Handbook
The "Blueprint" for reusable functional modules.
- **Tier 1 (Mandatory):** Auth, User, Generic CRUD, Notification Infra.
- **Tier 2 (Rec):** File Storage, Job Queues, Observability.
- **Tier 3 (Opt):** RBAC, Audit Logs, Workflow.

[Open Feature.md →](constitution/feature.md)

### 🛡️ 6. Audit & Health Reports
Comprehensive assessments of the project's Security, Architecture, and Production Readiness.
- **Security:** Credentials & Safety Audit.
- **Architecture:** Layering & Dependency Audit.
- **Production:** Hygiene & Reliability Check.
- **DX Score:** Developer Experience Assessment.

[View Audit Reports →](audit/security-audit-report.md)

## 🚀 Quick Start Philosophy

How to use this starter kit effectively?

1. **Read Architecture:** Understand "Why" we organize folders this way.
2. **Install Dependencies:** Follow the `pnpm` installation guide in the *Dependency Handbook*.
3. **Follow Conventions:** When writing new features, mimic the file structure and code style from the *Convention Handbook* and *Clean Code Constitution*.
4. **Use Core Features:** Do not build Auth or Uploads from scratch; use the modules defined in the *Feature Handbook*.

---

Backend Starter Kit Documentation Suite — Internal Developer Reference
Architecture • Convention • Clean Code • Dependency • Feature
