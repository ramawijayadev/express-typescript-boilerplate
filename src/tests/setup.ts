import path from "node:path";

import dotenv from "dotenv";
import { afterAll, beforeAll, beforeEach } from "vitest";

import { db, disconnectAll } from "@/core/database/connection";

// Explicitly load .env.test to ensure we use the test database
dotenv.config({ path: path.resolve(process.cwd(), ".env.test"), override: true });

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
    await db().$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
  }
};

beforeAll(() => {
  // 🛡️ SAFETY GUARD: Prevent running tests against non-test databases
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || !dbUrl.includes("_test")) {
    // eslint-disable-next-line no-console
    console.error("\n🚨 CRITICAL ERROR: Test runner is NOT connected to a Test Database!");
    // eslint-disable-next-line no-console
    console.error(`   Current DATABASE_URL: ${dbUrl}`);
    // eslint-disable-next-line no-console
    console.error(
      "   Tests must run against a database ending in '_test'. Aborting to prevent data loss.\n",
    );
    process.exit(1);
  }

  // Initialize reset flag for the current test file
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__db_reset_done_for_file = false;

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
  const isUserJourney = context.task.file?.name?.includes("user-journey");

  if (isUserJourney) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resetDone = (globalThis as any).__db_reset_done_for_file;

    if (!resetDone) {
      await resetDatabase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).__db_reset_done_for_file = true;
    }
    return;
  }

  await resetDatabase();
});

afterAll(async () => {
  await disconnectAll();
});
