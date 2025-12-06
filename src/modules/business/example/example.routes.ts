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
  path: "/examples",
  tags: ["Example"],
  request: {
    query: listExamplesQuerySchema,
  },
  responses: createApiPaginatedResponse(ExampleSchema, "List of examples", 200, [400, 422, 500]),
});

exampleRouter.get("/", validateQuery(listExamplesQuerySchema), (req, res) =>
  exampleController.list(req as unknown as TypedRequest<any, ListExamplesQuery>, res),
);

exampleRegistry.registerPath({
  method: "get",
  path: "/examples/{id}",
  tags: ["Example"],
  request: {
    params: idParamSchema,
  },
  responses: createApiResponse(ExampleSchema, "Example details", 200, [400, 404, 500]),
});

exampleRouter.get("/:id", validateParams(idParamSchema), (req, res) =>
  exampleController.find(req as unknown as TypedRequest<any, any, IdParam>, res),
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
  responses: createApiResponse(ExampleSchema, "Example created", 201, [400, 422, 500]),
});

exampleRouter.post("/", validateBody(createExampleSchema), (req, res) =>
  exampleController.create(req as TypedRequest<CreateExampleInput>, res),
);

exampleRegistry.registerPath({
  method: "put",
  path: "/examples/{id}",
  tags: ["Example"],
  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateExampleSchema,
        },
      },
    },
  },
  responses: createApiResponse(ExampleSchema, "Example updated", 200, [400, 404, 422, 500]),
});

exampleRouter.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateExampleSchema),
  (req, res) => exampleController.update(req as unknown as TypedRequest<UpdateExampleInput, any, IdParam>, res),
);

exampleRegistry.registerPath({
  method: "delete",
  path: "/examples/{id}",
  tags: ["Example"],
  request: {
    params: idParamSchema,
  },
  responses: createApiResponse(z.object({ deleted: z.boolean() }), "Example deleted", 200, [400, 404, 500]),
});

exampleRouter.delete("/:id", validateParams(idParamSchema), (req, res) =>
  exampleController.delete(req as unknown as TypedRequest<any, any, IdParam>, res),
);
