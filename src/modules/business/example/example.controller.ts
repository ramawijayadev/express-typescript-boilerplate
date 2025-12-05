
import type { TypedRequest } from "@/core/http/types";
import { created, ok, okPaginated } from "@/shared/http/api-response";
import type { IdParam } from "@/shared/schemas/common.schemas";
import { generatePaginationLinks } from "@/shared/utils/pagination";

import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";
import type { ExampleService } from "./example.service";
import type { Request, Response } from "express";

export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  async list(req: TypedRequest<unknown, ListExamplesQuery>, res: Response) {
    const query = req.query;
    const { data, meta } = await this.service.list(query);
    const links = generatePaginationLinks(req as unknown as Request, meta);
    return okPaginated(res, data, meta, links);
  }

  async find(req: TypedRequest<unknown, unknown, IdParam>, res: Response) {
    const id = req.params.id; // Already a number
    const result = await this.service.find(id);
    return ok(res, result);
  }

  async create(req: Request<Record<string, string>, unknown, CreateExampleInput>, res: Response) {
    const result = await this.service.create(req.body);
    return created(res, result);
  }

  async update(req: TypedRequest<UpdateExampleInput, unknown, IdParam>, res: Response) {
    const id = req.params.id;
    const result = await this.service.update(id, req.body);
    return ok(res, result);
  }

  async delete(req: TypedRequest<unknown, unknown, IdParam>, res: Response) {
    const id = req.params.id;
    await this.service.delete(id);
    return ok(res, { deleted: true });
  }
}
