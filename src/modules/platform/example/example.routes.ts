import { Router } from "express";

import { validateBody, validateParams, validateQuery } from "@/core/http/validation.middleware";

import { ExampleController } from "./example.controller";
import { ExampleRepository } from "./example.repository";
import { ExampleService } from "./example.service";

import {
  createExampleSchema,
  exampleIdSchema,
  listExamplesQuerySchema,
  updateExampleSchema,
} from "./example.schemas";

import type { Request } from "express";
import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";

export const exampleRouter = Router();

// Instantiate dependencies
const exampleRepository = new ExampleRepository();
const exampleService = new ExampleService(exampleRepository);
const exampleController = new ExampleController(exampleService);

exampleRouter.get("/", validateQuery(listExamplesQuerySchema), (req, res) =>
  exampleController.list(
    req as unknown as Request<unknown, unknown, unknown, ListExamplesQuery>,
    res,
  ),
);

exampleRouter.get("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.find(req, res),
);

exampleRouter.post("/", validateBody(createExampleSchema), (req, res) =>
  exampleController.create(req as Request<unknown, unknown, CreateExampleInput>, res),
);

exampleRouter.put(
  "/:id",
  validateParams(exampleIdSchema),
  validateBody(updateExampleSchema),
  (req, res) =>
    exampleController.update(req as Request<{ id: string }, unknown, UpdateExampleInput>, res),
);

exampleRouter.delete("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.delete(req, res),
);
