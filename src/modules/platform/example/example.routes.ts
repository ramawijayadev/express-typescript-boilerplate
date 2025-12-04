import { Router } from "express";

import { validateBody, validateParams, validateQuery } from "@/core/http/validation.middleware";

import { exampleController } from ".";

import {
  createExampleSchema,
  exampleIdSchema,
  listExamplesQuerySchema,
  updateExampleSchema,
} from "./example.schemas";

export const exampleRouter = Router();

exampleRouter.get("/", validateQuery(listExamplesQuerySchema), (req, res) =>
  exampleController.list(req, res),
);

exampleRouter.get("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.find(req, res),
);

exampleRouter.post("/", validateBody(createExampleSchema), (req, res) =>
  exampleController.create(req, res),
);

exampleRouter.put(
  "/:id",
  validateParams(exampleIdSchema),
  validateBody(updateExampleSchema),
  (req, res) => exampleController.update(req, res),
);

exampleRouter.delete("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.delete(req, res),
);
