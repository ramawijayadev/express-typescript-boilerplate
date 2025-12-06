import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { z } from "zod";

import { validateBody, validateParams, validateQuery } from "@/core/http/middlewares/validation.middleware";
import type { TypedRequest } from "@/core/http/types";
import {
  createApiPaginatedResponse,
  createApiResponse,
} from "@/shared/open-api/openapi-response-builders";
import { idParamSchema } from "@/shared/schemas/common.schemas";
import type { IdParam } from "@/shared/schemas/common.schemas";

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

import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";

export const exampleRegistry = new OpenAPIRegistry();
export const exampleRouter = Router();

exampleRegistry.register("Example", ExampleSchema);

const exampleRepository = new ExampleRepository();
const exampleService = new ExampleService(exampleRepository);
const exampleController = new ExampleController(exampleService);

exampleRegistry.registerPath({
  method: "get",
  path: "/business/examples",
  tags: ["Example"],
  request: {
    query: listExamplesQuerySchema,
  },
  responses: createApiPaginatedResponse(ExampleSchema, "List of examples"),
});

exampleRouter.get("/", validateQuery(listExamplesQuerySchema), (req, res) =>
  exampleController.list(req as TypedRequest<unknown, ListExamplesQuery>, res),
);

exampleRegistry.registerPath({
  method: "get",
  path: "/business/examples/{id}",
  tags: ["Example"],
  request: {
    params: exampleIdSchema,
  },
  responses: createApiResponse(ExampleSchema, "Example details"),
});

exampleRouter.get("/:id", validateParams(idParamSchema), (req, res) =>
  exampleController.find(req as TypedRequest<unknown, unknown, IdParam>, res),
);

exampleRegistry.registerPath({
  method: "post",
  path: "/business/examples",
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
  exampleController.create(req as TypedRequest<CreateExampleInput>, res),
);

exampleRegistry.registerPath({
  method: "put",
  path: "/business/examples/{id}",
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
  (req, res) => exampleController.update(req as TypedRequest<UpdateExampleInput, unknown, IdParam>, res),
);

exampleRegistry.registerPath({
  method: "delete",
  path: "/business/examples/{id}",
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

exampleRouter.delete("/:id", validateParams(idParamSchema), (req, res) =>
  exampleController.delete(req as TypedRequest<unknown, unknown, IdParam>, res),
);
