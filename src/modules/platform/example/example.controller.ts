import { created, ok, okPaginated } from "@/shared/http/api-response";
import { generatePaginationLinks } from "@/shared/utils/pagination";

import { ExampleService } from "./example.service";

import type { CreateExampleInput, UpdateExampleInput } from "./example.schemas";
import type { Request, Response } from "express";

export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  async list(req: Request<any, any, any, any>, res: Response) {
    const { data, meta } = await this.service.list(req.query);
    const links = generatePaginationLinks(req, meta);
    return okPaginated(res, data, meta, links);
  }

  async find(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await this.service.find(id);
    return ok(res, result);
  }

  async create(req: Request<any, any, CreateExampleInput>, res: Response) {
    const result = await this.service.create(req.body);
    return created(res, result);
  }

  async update(req: Request<any, any, UpdateExampleInput>, res: Response) {
    const id = Number(req.params.id);
    const result = await this.service.update(id, req.body);
    return ok(res, result);
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await this.service.delete(id);
    return ok(res, { deleted: true });
  }
}
