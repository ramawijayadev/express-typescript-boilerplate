import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";

import { db } from "@/core/database/connection";
import { authenticate } from "@/core/http/middlewares/authenticate.middleware";
import { validateBody } from "@/core/http/middlewares/validation.middleware";
import { authenticatedHandler } from "@/core/http/types";
import { createApiResponse } from "@/shared/open-api/openapi-response-builders";

import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { UserSchema, updateUserSchema } from "./users.schemas";
import { UsersService } from "./users.service";

import type { UpdateUserBody } from "./users.types";

export const userRegistry = new OpenAPIRegistry();
export const userRouter = Router();

userRegistry.register("User", UserSchema);

const repo = new UsersRepository(db());
const service = new UsersService(repo);
const controller = new UsersController(service);

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get("/me", authenticate, 
  authenticatedHandler((req, res, next) => controller.me(req, res))
);

userRegistry.registerPath({
  method: "get",
  path: "/users/me",
  tags: ["User"],
  responses: createApiResponse(UserSchema, "User", 200, [401, 500]),
  security: [{ bearerAuth: [] }],
});

usersRouter.patch("/me", authenticate, validateBody(updateUserSchema),
  authenticatedHandler<UpdateUserBody>((req, res, next) => controller.updateMe(req, res))
);

userRegistry.registerPath({
  method: "patch",
  path: "/users/me",
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateUserSchema,
        },
      },
    },
  },
  responses: createApiResponse(UserSchema, "User", 200, [401, 422, 500]),
  security: [{ bearerAuth: [] }],
});
