import { Router } from "express";

import { validateBody, validateParams, validateQuery } from "@/core/http/validation.middleware";

import { exampleController } from "./example.controller";
import {
  createExampleSchema,
  exampleIdSchema,
  listExamplesQuerySchema,
  updateExampleSchema,
} from "./example.schemas";

export const exampleRouter = Router();

exampleRouter.get(
  "/",
  validateQuery(listExamplesQuerySchema),
  exampleController.list.bind(exampleController),
);

exampleRouter.get(
  "/:id",
  validateParams(exampleIdSchema),
  exampleController.find.bind(exampleController),
);

exampleRouter.post(
  "/",
  validateBody(createExampleSchema),
  exampleController.create.bind(exampleController),
);

exampleRouter.put(
  "/:id",
  validateParams(exampleIdSchema),
  validateBody(updateExampleSchema),
  exampleController.update.bind(exampleController),
);

exampleRouter.delete(
  "/:id",
  validateParams(exampleIdSchema),
  exampleController.delete.bind(exampleController),
);
