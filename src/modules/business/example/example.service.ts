import { StatusCodes } from "http-status-codes";

import { AppError } from "@/shared/errors/AppError";

import type { ExampleRepository } from "./example.repository";
import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";
import type { ExampleId } from "./example.types";

export class ExampleService {
  constructor(private readonly repo: ExampleRepository) {}

  async list(query: ListExamplesQuery) {
    return this.repo.findAll({ search: query.search }, { page: query.page, limit: query.limit });
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
      description: input.description,
    });
  }

  async update(id: ExampleId, input: UpdateExampleInput) {
    const updated = await this.repo.update(id, {
      name: input.name,
      description: input.description,
    });

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
