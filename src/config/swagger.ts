import swaggerJsdoc from "swagger-jsdoc";

import { env } from "@/app/env";
import { appConfig } from "./app";

const options: swaggerJsdoc.Options = {
  definition: {
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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.schemas.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
