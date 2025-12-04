import { Router } from "express";

import { validateBody, validateQuery } from "@/core/http/validation.middleware";

import { exampleController } from "./example.controller";
import {
  createExampleSchema,
  listExamplesQuerySchema,
  updateExampleSchema,
} from "./example.schemas";

export const exampleRouter = Router();

exampleRouter.get(
  "/",
  validateQuery(listExamplesQuerySchema),
  exampleController.list.bind(exampleController),
);

exampleRouter.get("/:id", exampleController.find.bind(exampleController));

exampleRouter.post(
  "/",
  validateBody(createExampleSchema),
  exampleController.create.bind(exampleController),
);

exampleRouter.put(
  "/:id",
  validateBody(updateExampleSchema),
  exampleController.update.bind(exampleController),
);

exampleRouter.delete("/:id", exampleController.delete.bind(exampleController));
