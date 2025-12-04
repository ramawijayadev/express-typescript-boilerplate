import { created, ok } from "@/shared/http/api-response";

import { ExampleService } from "./example.service";

import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";
import type { Request, Response } from "express";

export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  async list(req: Request, res: Response) {
    const query = req.query as unknown as ListExamplesQuery;
    const result = await this.service.list(query);
    return ok(res, result);
  }

  async find(req: Request, res: Response) {
    const { id } = req.params as unknown as { id: number };
    const result = await this.service.find(id);
    return ok(res, result);
  }

  async create(req: Request, res: Response) {
    const body = req.body as CreateExampleInput;
    const result = await this.service.create(body);
    return created(res, result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as unknown as { id: number };
    const body = req.body as UpdateExampleInput;
    const result = await this.service.update(id, body);
    return ok(res, result);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as unknown as { id: number };
    await this.service.delete(id);
    return ok(res, { deleted: true });
  }
}
