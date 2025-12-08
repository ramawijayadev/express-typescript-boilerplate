import { StatusCodes } from "http-status-codes";

import { AppError } from "@/shared/errors/AppError";

import type { ExampleRepository } from "./example.repository";
import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";
import type { ExampleId } from "./example.types";

export class ExampleService {
  constructor(private readonly repo: ExampleRepository) {}

  async list(query: ListExamplesQuery) {
    const filter: { search?: string } = {};
    if (query.search) {
      filter.search = query.search;
    }
    return this.repo.findAll(filter, { page: query.page ?? 1, limit: query.limit ?? 10 });
  }

  async find(id: ExampleId) {
    const found = await this.repo.findById(id);

    if (!found) {
      throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
    }

    return found;
  }

  async create(input: CreateExampleInput) {
    return this.repo.create({
      name: input.name,
      description: input.description ?? null,
    });
  }

  async update(id: ExampleId, input: UpdateExampleInput) {
    const data: { name?: string; description?: string | null } = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;

    const updated = await this.repo.update(id, data);

    if (!updated) {
      throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
    }

    return updated;
  }

  async delete(id: ExampleId) {
    const deleted = await this.repo.delete(id);

    if (!deleted) {
      throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
    }
  }
}
