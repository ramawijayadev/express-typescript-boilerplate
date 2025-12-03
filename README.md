# Express TypeScript Boilerplate

Boilerplate untuk membangun REST API dengan struktur yang rapi dan siap dikembangkan ke skala lebih besar.

Tech utama:

- Node.js + TypeScript
- Express
- PostgreSQL + Prisma
- Redis (cache & queue)
- Pino (logging)
- Vitest + Supertest (testing)
- pnpm (package manager)

---

## 1. Struktur Project (Singkat)

```txt
express-typescript-starterkit/
  package.json
  tsconfig.json
  tsconfig.build.json
  .eslintrc.cjs
  .prettierrc
  .gitignore
  .env.example

  /logs/              # log file (ignored)
  /migrations/        # migration DB
  /scripts/           # helper scripts
  /docs/              # dokumentasi (arsitektur, conventions, dll)

  /src
    /app              # bootstrap app (express, env, server)
    /config           # config app/db/logging/security/mail/queue
    /core             # http, logging, security, db, queue, mail, storage, observability
    /shared           # types, utils, errors, http response
    /modules
      /platform       # fitur core (auth, users, files, dll)
      /business       # fitur domain / bisnis
    /jobs             # background jobs & handlers
    /cli              # command line tools (migrate, seed, dll)
    /tests
      /e2e            # end-to-end tests
      /perf           # k6 performance tests
```

Struktur module (contoh):

```txt
src/modules/platform/users/
  users.routes.ts
  users.controller.ts
  users.service.ts
  users.repository.ts
  users.schemas.ts
  users.types.ts
  users.mappers.ts
  __tests__/
    users.service.unit.spec.ts
    users.repository.unit.spec.ts
    users.routes.integration.spec.ts
```

---

## 2. Prasyarat

- Node.js (LTS)
- pnpm
- PostgreSQL
- Redis
- Docker & Docker Compose (disarankan untuk lokal)
- k6 (opsional, untuk performance testing)

---

## 3. Instalasi & Setup

### 3.1. Install dependency

```bash
pnpm install
```

### 3.2. Setup environment

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- dll.

### 3.3. Prisma & database

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

---

## 4. Script (Contoh)

Tambahkan script berikut (atau serupa) di `package.json`:

```jsonc
{
  "scripts": {
    "dev": "tsx src/app/server.ts",
    "build": "rimraf dist && tsc -p tsconfig.build.json",
    "start": "node dist/app/server.js",

    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.{ts,js,json,md}\"",

    "test": "vitest",
    "test:e2e": "vitest run src/tests/e2e --runInBand"
  }
}
```

---

## 5. Testing

### Unit & Integration

- Lokasi: `src/modules/**/__tests__/*.spec.ts`
- Jalan:

```bash
pnpm test
```

### End-to-End

- Lokasi: `src/tests/e2e/*.e2e.spec.ts`
- Jalan (sesuai script):

```bash
pnpm test:e2e
```

### Performance (k6, opsional)

- Lokasi: `tests/perf/*.js`
- Contoh:

```bash
k6 run tests/perf/k6-smoke.js
```

---

## 6. Dokumentasi Tambahan

Dokumen pendukung (disarankan taruh di `/docs`):

- `overview.html` – overview dokumentasi
- `architecture.html` – penjelasan arsitektur & layering
- `convention.html` – naming, struktur, pattern, testing
- `depedency.html` – daftar dependency & peran masing-masing
- `feature.html` – dokumentasi feature dasar

Starterkit ini dimaksudkan sebagai baseline. Module di `modules/platform` bisa dipakai ulang di banyak project, sedangkan `modules/business` berisi logic spesifik domain/aplikasi.
