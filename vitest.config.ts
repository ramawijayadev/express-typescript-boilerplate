// vitest.config.ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    env: {
      JWT_SECRET: "test-secret",
      JWT_ACCESS_EXPIRATION: "1m",
      JWT_REFRESH_EXPIRATION: "5m",
    },
  },
  resolve: {
    alias: {
      "@/generated/prisma": path.resolve(__dirname, "src/generated/prisma/client"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
