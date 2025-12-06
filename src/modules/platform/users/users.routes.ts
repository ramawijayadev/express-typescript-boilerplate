import { Router } from "express";
import { authenticate } from "@/core/http/middlewares/authenticate";
import { validateRequest } from "@/core/http/middlewares/validate-request.middleware";

import { prisma } from "@/core/database/connection";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { updateUserSchema } from "./users.schemas";

// DI Setup
const repo = new UsersRepository(prisma);
const service = new UsersService(repo);
const controller = new UsersController(service);

export const usersRouter = Router();

usersRouter.use(authenticate); // Protect all routes

usersRouter.get("/me", controller.me.bind(controller));
usersRouter.patch("/me", validateRequest({ body: updateUserSchema }), controller.updateMe.bind(controller));
