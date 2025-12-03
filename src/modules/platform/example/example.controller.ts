import { created, ok } from "@/shared/http/api-response";

import {
  createExampleSchema,
  listExamplesQuerySchema,
  updateExampleSchema,
} from "./example.schemas";
import { ExampleService } from "./example.service";

import type { NextFunction, Request, Response } from "express";

const service = new ExampleService();

export class ExampleController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listExamplesQuerySchema.parse(req.query);
      const result = await service.list(query);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await service.getById(id);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createExampleSchema.parse(req.body);
      const result = await service.create(body);
      return created(res, result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = updateExampleSchema.parse(req.body);
      const result = await service.update(id, body);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await service.delete(id);
      return ok(res, { deleted: true });
    } catch (err) {
      next(err);
    }
  }
}

export const exampleController = new ExampleController();
