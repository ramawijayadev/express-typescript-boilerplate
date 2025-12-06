
import type { TypedRequest } from "@/core/http/types";
import { created, ok, okPaginated } from "@/shared/http/api-response";
import type { IdParam } from "@/shared/schemas/common.schemas";
import { generatePaginationLinks } from "@/shared/utils/pagination";

import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";
import type { ExampleService } from "./example.service";
import type { Request, Response } from "express";

export class ExampleController {
  /**
   * Creates an instance of ExampleController.
   * @param service - The example service.
   */
  constructor(private readonly service: ExampleService) {}

  /**
   * Handles the request to list examples.
   *
   * @param req - The request object containing query parameters.
   * @param res - The response object.
   * @returns A paginated response with the list of examples.
   */
  async list(req: TypedRequest<unknown, ListExamplesQuery>, res: Response) {
    const query = req.query;
    const { data, meta } = await this.service.list(query);
    const links = generatePaginationLinks(req as unknown as Request, meta);
    return okPaginated(res, data, meta, links);
  }

  /**
   * Handles the request to find a specific example.
   *
   * @param req - The request object containing the example ID in params.
   * @param res - The response object.
   * @returns A response with the found example.
   */
  async find(req: TypedRequest<unknown, unknown, IdParam>, res: Response) {
    const id = req.params.id; // Already a number
    const result = await this.service.find(id);
    return ok(res, result);
  }

  /**
   * Handles the request to create a new example.
   *
   * @param req - The request object containing the new example data in body.
   * @param res - The response object.
   * @returns A response with the created example.
   */
  async create(req: Request<Record<string, string>, unknown, CreateExampleInput>, res: Response) {
    const result = await this.service.create(req.body);
    return created(res, result);
  }

  /**
   * Handles the request to update an example.
   *
   * @param req - The request object containing the example ID in params and update data in body.
   * @param res - The response object.
   * @returns A response with the updated example.
   */
  async update(req: TypedRequest<UpdateExampleInput, unknown, IdParam>, res: Response) {
    const id = req.params.id;
    const result = await this.service.update(id, req.body);
    return ok(res, result);
  }

  /**
   * Handles the request to delete an example.
   *
   * @param req - The request object containing the example ID in params.
   * @param res - The response object.
   * @returns A response confirming the deletion.
   */
  async delete(req: TypedRequest<unknown, unknown, IdParam>, res: Response) {
    const id = req.params.id;
    await this.service.delete(id);
    return ok(res, { deleted: true });
  }
}
