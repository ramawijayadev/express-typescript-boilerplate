import { Router } from "express";

import { exampleController } from "./example.controller";

export const exampleRouter = Router();

exampleRouter.get("/", exampleController.list.bind(exampleController));
exampleRouter.get("/:id", exampleController.getById.bind(exampleController));
exampleRouter.post("/", exampleController.create.bind(exampleController));
exampleRouter.put("/:id", exampleController.update.bind(exampleController));
exampleRouter.delete("/:id", exampleController.delete.bind(exampleController));
