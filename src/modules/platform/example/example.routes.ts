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

export const exampleRouter = Router();

// Instantiate dependencies
const exampleRepository = new ExampleRepository();
const exampleService = new ExampleService(exampleRepository);
const exampleController = new ExampleController(exampleService);

exampleRouter.get("/", validateQuery(listExamplesQuerySchema), (req, res) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exampleController.list(req as any, res),
);

exampleRouter.get("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.find(req, res),
);

exampleRouter.post("/", validateBody(createExampleSchema), (req, res) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exampleController.create(req as any, res),
);

exampleRouter.put(
  "/:id",
  validateParams(exampleIdSchema),
  validateBody(updateExampleSchema),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req, res) => exampleController.update(req as any, res),
);

exampleRouter.delete("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.delete(req, res),
);
