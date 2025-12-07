// vitest.config.ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    env: {
      JWT_SECRET: "test-secret-key-min-32-characters-for-validation-requirements",
      JWT_ACCESS_EXPIRATION: "1m",
      JWT_REFRESH_EXPIRATION: "5m",
    },
    setupFiles: ["./src/tests/setup.ts"], // Global setup
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
