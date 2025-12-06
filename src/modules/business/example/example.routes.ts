import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { z } from "zod";

import { validateBody, validateParams, validateQuery } from "@/core/http/middlewares/validation.middleware";
import {
  createApiPaginatedResponse,
  createApiResponse,
} from "@/shared/open-api/openapi-response-builders";
import { idParamSchema } from "@/shared/schemas/common.schemas";

import { ExampleController } from "./example.controller";
import { ExampleRepository } from "./example.repository";
import {
  ExampleSchema,
  createExampleSchema,
  exampleIdSchema,
  listExamplesQuerySchema,
  updateExampleSchema,
} from "./example.schemas";
import { ExampleService } from "./example.service";

export const exampleRegistry = new OpenAPIRegistry();
export const exampleRouter = Router();

exampleRegistry.register("Example", ExampleSchema);

const exampleRepository = new ExampleRepository();
const exampleService = new ExampleService(exampleRepository);
const exampleController = new ExampleController(exampleService);

exampleRegistry.registerPath({
  method: "get",
  path: "/examples",
  tags: ["Example"],
  request: {
    query: listExamplesQuerySchema,
  },
  responses: createApiPaginatedResponse(ExampleSchema, "List of examples"),
});

exampleRouter.get("/", validateQuery(listExamplesQuerySchema), (req, res) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exampleController.list(req as any, res),
);

exampleRegistry.registerPath({
  method: "get",
  path: "/examples/{id}",
  tags: ["Example"],
  request: {
    params: exampleIdSchema,
  },
  responses: createApiResponse(ExampleSchema, "Example details"),
});

exampleRouter.get("/:id", validateParams(idParamSchema), (req, res) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exampleController.find(req as any, res),
);

exampleRegistry.registerPath({
  method: "post",
  path: "/examples",
  tags: ["Example"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createExampleSchema,
        },
      },
    },
  },
  responses: createApiResponse(ExampleSchema, "Example created", 201),
});

exampleRouter.post("/", validateBody(createExampleSchema), (req, res) =>
  exampleController.create(req, res),
);

exampleRegistry.registerPath({
  method: "put",
  path: "/examples/{id}",
  tags: ["Example"],
  request: {
    params: exampleIdSchema,
    body: {
      content: {
        "application/json": {
          schema: updateExampleSchema,
        },
      },
    },
  },
  responses: createApiResponse(ExampleSchema, "Example updated"),
});

exampleRouter.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateExampleSchema),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req, res) => exampleController.update(req as any, res),
);

exampleRegistry.registerPath({
  method: "delete",
  path: "/examples/{id}",
  tags: ["Example"],
  request: {
    params: exampleIdSchema,
    body: {
      content: {
        "application/json": {
          schema: updateExampleSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.object({ deleted: z.boolean() }), "Example deleted"),
});
import type { Request } from "express"; // Import Request explicitly

// Routes
exampleRouter.get("/", validateQuery(listExamplesQuerySchema), (req, res) =>
  exampleController.list(req as unknown as Request<unknown, unknown, unknown, z.infer<typeof listExamplesQuerySchema>>, res),
);
exampleRouter.get("/:id", validateParams(idParamSchema), (req, res) =>
  exampleController.find(req as unknown as Request<z.infer<typeof idParamSchema>>, res),
);
exampleRouter.post("/", validateBody(createExampleSchema), (req, res) =>
  exampleController.create(req as unknown as Request<Record<string, string>, unknown, z.infer<typeof createExampleSchema>>, res),
);
exampleRouter.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateExampleSchema),
  (req, res) => exampleController.update(req as unknown as Request<z.infer<typeof idParamSchema>, unknown, z.infer<typeof updateExampleSchema>>, res),
);
exampleRouter.delete("/:id", validateParams(idParamSchema), (req, res) =>
  exampleController.delete(req as unknown as Request<z.infer<typeof idParamSchema>>, res),
);
