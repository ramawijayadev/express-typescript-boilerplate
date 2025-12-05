import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { z } from "zod";

import { validateBody, validateParams, validateQuery } from "@/core/http/validation.middleware";
import {
  createApiPaginatedResponse,
  createApiResponse,
} from "@/shared/open-api/openapi-response-builders";

import { ExampleController } from "./example.controller";
import { ExampleRepository } from "./example.repository";
import {
  createExampleSchema,
  ExampleSchema,
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
  path: "/platform/examples",
  tags: ["Example"],
  request: {
    query: listExamplesQuerySchema,
  },
  responses: createApiPaginatedResponse(ExampleSchema, "List of examples"),
});

exampleRouter.get("/", validateQuery(listExamplesQuerySchema), (req, res) =>
  exampleController.list(req, res),
);

exampleRegistry.registerPath({
  method: "get",
  path: "/platform/examples/{id}",
  tags: ["Example"],
  request: {
    params: exampleIdSchema,
  },
  responses: createApiResponse(ExampleSchema, "Example details"),
});

exampleRouter.get("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.find(req, res),
);

exampleRegistry.registerPath({
  method: "post",
  path: "/platform/examples",
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
  path: "/platform/examples/{id}",
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
  validateParams(exampleIdSchema),
  validateBody(updateExampleSchema),
  (req, res) => exampleController.update(req, res),
);

exampleRegistry.registerPath({
  method: "delete",
  path: "/platform/examples/{id}",
  tags: ["Example"],
  request: {
    params: exampleIdSchema,
  },
  responses: createApiResponse(z.object({ deleted: z.boolean() }), "Example deleted"),
});

exampleRouter.delete("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.delete(req, res),
);
