"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// vitest.config.ts
var node_path_1 = require("node:path");
var config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
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
            "@/generated/prisma": node_path_1.default.resolve(__dirname, "src/generated/prisma/client"),
            "@": node_path_1.default.resolve(__dirname, "src"),
        },
    },
});
