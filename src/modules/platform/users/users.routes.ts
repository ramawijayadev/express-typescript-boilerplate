import { Router } from "express";

import { db } from "@/core/database/connection";
import { authenticate } from "@/core/http/middlewares/authenticate.middleware";
import { validateBody } from "@/core/http/middlewares/validation.middleware";
import type { AuthenticatedRequest } from "@/core/http/types";

import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { updateUserSchema } from "./users.schemas";
import { UsersService } from "./users.service";

import type { UpdateUserBody } from "./users.types";

// DI Setup
const repo = new UsersRepository(db());
const service = new UsersService(repo);
const controller = new UsersController(service);

export const usersRouter = Router();

usersRouter.use(authenticate); // Protect all routes

usersRouter.get("/me", authenticate, (req, res) =>
  controller.me(req as AuthenticatedRequest, res),
);
usersRouter.patch("/me", authenticate, validateBody(updateUserSchema), (req, res) =>
  controller.updateMe(req as AuthenticatedRequest<UpdateUserBody>, res),
);
