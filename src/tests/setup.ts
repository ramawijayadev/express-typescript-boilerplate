import { beforeAll } from "vitest";

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
