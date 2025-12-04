import swaggerJsdoc from "swagger-jsdoc";

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
        url: `http://localhost:${appConfig.port}/api/v1`,
        description: "Development server",
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
