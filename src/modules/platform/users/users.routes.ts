import { Router } from "express";
import { authenticate } from "@/core/http/middlewares/authenticate.middleware";
import { validateBody } from "@/core/http/middlewares/validation.middleware";

import { db } from "@/core/database/connection";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { updateUserSchema } from "./users.schemas";

// DI Setup
const repo = new UsersRepository(db());
const service = new UsersService(repo);
const controller = new UsersController(service);

export const usersRouter = Router();

usersRouter.use(authenticate); // Protect all routes

usersRouter.get("/me", (req, res) => controller.me(req as any, res));
usersRouter.patch("/me", validateBody(updateUserSchema), (req, res) => controller.updateMe(req as any, res));
