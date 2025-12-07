import { afterAll, beforeAll, beforeEach } from "vitest";

import { db, disconnectAll } from "@/core/database/connection";

const resetDatabase = async () => {
  const tablenames = await db().$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }: { tablename: string }) => tablename)
    .filter((name: string) => name !== "_prisma_migrations")
    .map((name: string) => `"public"."${name}"`)
    .join(", ");

  if (tables.length > 0) {
    await db().$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  }
};

beforeAll(() => {
  const isLocal =
    process.env.DATABASE_URL?.includes("localhost") ||
    process.env.DATABASE_URL?.includes("127.0.0.1") ||
    process.env.DATABASE_URL?.includes("postgres"); // 'postgres' service name in docker
  const isTestEnv = process.env.NODE_ENV === "test";

  if (!isTestEnv) {
    // Silent
  }

  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
    throw new Error(
      "⛔️ FATAL: Attempting to run tests in PRODUCTION/STAGING environment. Aborting to protect data.",
    );
  }

  if (!isLocal && !process.env.CI) {
    // Silent
  }
});

beforeEach(async (context) => {
  if (context.task.file?.name?.includes("user-journey")) {
    return;
  }
  await resetDatabase();
});

afterAll(async () => {
  await disconnectAll();
});
