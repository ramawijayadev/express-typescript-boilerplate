import { afterAll, beforeAll, beforeEach } from "vitest";

import { db, disconnectAll } from "@/core/database/connection";

let dbResetDoneForFile = false;

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
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || !dbUrl.includes("_test")) {
    throw new Error(
      [
        "\n🚨 CRITICAL ERROR: Test runner is NOT connected to a Test Database!",
        `   Current DATABASE_URL: ${dbUrl}`,
        "   Tests must run against a database ending in '_test'. Aborting to prevent data loss.\n",
      ].join("\n"),
    );
  }

  dbResetDoneForFile = false;

  const isLocal =
    process.env.DATABASE_URL?.includes("localhost") ||
    process.env.DATABASE_URL?.includes("127.0.0.1") ||
    process.env.DATABASE_URL?.includes("postgres");
  const isTestEnv = process.env.NODE_ENV === "test";

  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
    throw new Error(
      "FATAL: Attempting to run tests in PRODUCTION/STAGING environment. Aborting to protect data.",
    );
  }

  if (!isLocal && !process.env.CI) {
    throw new Error(
      "Refusing to run tests against a non-local database outside CI. Check your DATABASE_URL and environment.",
    );
  }

  if (!isTestEnv) {
    throw new Error(
      "Tests must run with NODE_ENV='test'. Aborting to avoid unpredictable behavior.",
    );
  }
});

beforeEach(async (context) => {
  const isUserJourney = context.task.file?.name?.includes("user-journey");

  if (isUserJourney) {
    if (!dbResetDoneForFile) {
      await resetDatabase();
      dbResetDoneForFile = true;
    }
    return;
  }

  await resetDatabase();
});

afterAll(async () => {
  await disconnectAll();
});
