import { created, ok } from "@/shared/http/api-response";

import {
  createExampleSchema,
  listExamplesQuerySchema,
  updateExampleSchema,
} from "./example.schemas";
import { ExampleService } from "./example.service";

import type { Request, Response } from "express";

const service = new ExampleService();

export class ExampleController {
  async list(req: Request, res: Response) {
    const query = listExamplesQuerySchema.parse(req.query);
    const result = await service.list(query);
    return ok(res, result, "Examples retrieved successfully!");
  }

  async find(req: Request, res: Response) {
    const { id } = req.params;
    const result = await service.find(id);
    return ok(res, result);
  }

  async create(req: Request, res: Response) {
    const body = createExampleSchema.parse(req.body);
    const result = await service.create(body);
    return created(res, result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const body = updateExampleSchema.parse(req.body);
    const result = await service.update(id, body);
    return ok(res, result);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await service.delete(id);
    return ok(res, { deleted: true });
  }
}

export const exampleController = new ExampleController();
