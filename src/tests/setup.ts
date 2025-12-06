/**
 * Global test setup file for Vitest.
 * Handles environment validation and global hook registration.
 */
import { beforeAll } from "vitest";

beforeAll(() => {
  // --------------------------------------------------------------------------
  // GLOBAL DATABASE SAFETY CHECK
  // --------------------------------------------------------------------------
  const isLocal =
    process.env.DATABASE_URL?.includes("localhost") ||
    process.env.DATABASE_URL?.includes("127.0.0.1") ||
    process.env.DATABASE_URL?.includes("postgres"); // 'postgres' service name in docker
  const isTestEnv = process.env.NODE_ENV === "test";

  if (!isTestEnv) {
    // eslint-disable-next-line no-console
    console.warn("⚠️  WARNING: NODE_ENV is not 'test'. Global safety setup proceeding with caution.");
  }

  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
    throw new Error(
      "⛔️ FATAL: Attempting to run tests in PRODUCTION/STAGING environment. Aborting to protect data.",
    );
  }

  // Additional check for remote DBs (naive but helpful)
  if (!isLocal && !process.env.CI) {
    // eslint-disable-next-line no-console
    console.warn("⚠️  WARNING: Connected to a non-local database. Ensure this is intentional.");
  }
  // --------------------------------------------------------------------------
});
