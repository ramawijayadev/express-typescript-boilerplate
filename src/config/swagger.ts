import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { env } from "@/app/env";
import { exampleRegistry } from "@/modules/business/example/example.routes";
import { authRegistry } from "@/modules/platform/auth/auth.routes";
import { healthRegistry } from "@/modules/platform/health/health.routes";

import { appConfig } from "./app";

const registry = new OpenAPIRegistry();

// Register Bearer Auth
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const getOpenApiDocumentation = () => {
  const generator = new OpenApiGeneratorV3([
    ...registry.definitions,
    ...authRegistry.definitions,
    ...exampleRegistry.definitions,
    ...healthRegistry.definitions,
  ]);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Express TypeScript Boilerplate API",
      version: "1.0.0",
      description: "API Documentation for the Express TypeScript Boilerplate",
    },
    servers: [
      {
        url: env.SWAGGER_SERVER_URL ?? `http://localhost:${appConfig.port}/api/v1`,
        description: "API Server",
      },
    ],
    security: [{ bearerAuth: [] }],
  });
};

/**
 * Generated OpenAPI/Swagger documentation specification.
 * Aggregates all registered Zod schemas and route definitions into a single JSON object.
 */
export const swaggerSpec = getOpenApiDocumentation();
