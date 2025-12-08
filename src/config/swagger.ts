import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { env } from "@/config/env";
import { authRegistry } from "@/modules/auth/auth.routes";
import { exampleRegistry } from "@/modules/example/example.routes";
import { healthRegistry } from "@/modules/health/health.routes";
import { jobsRegistry } from "@/modules/jobs/jobs.routes";
import { userRegistry } from "@/modules/users/users.routes";

import { appConfig } from "./app";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const getOpenApiDocumentation = () => {
  const generator = new OpenApiGeneratorV3([
    ...registry.definitions,
    ...healthRegistry.definitions,
    ...authRegistry.definitions,
    ...userRegistry.definitions,
    ...jobsRegistry.definitions,
    ...exampleRegistry.definitions,
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
  });
};

export const swaggerSpec = getOpenApiDocumentation();
