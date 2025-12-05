import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import { ok } from "@/shared/http/api-response";

export const healthRegistry = new OpenAPIRegistry();
export const healthRouter = Router();

export const HealthSchema = z.object({
  status: z.string(),
  version: z.string(),
  timestamp: z.string().datetime(),
});

healthRegistry.registerPath({
  method: "get",
  path: "/api/v1/health",
  tags: ["Health"],
  responses: createApiResponse(HealthSchema, "Server health status"),
});

healthRouter.get("/health", (_req, res) => {
  return ok(res, {
    status: "Server up and running gracefully!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});
