import { StatusCodes } from "http-status-codes";

import { AppError } from "@/shared/errors/AppError";

import { ExampleRepository } from "./example.repository";

import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";
import type { ExampleId } from "./example.types";

export class ExampleService {
  constructor(private readonly repo = new ExampleRepository()) {}

  private parseId(id: string): ExampleId {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid ID format");
    }
    return parsed;
  }

  async list(query: ListExamplesQuery) {
    return this.repo.findAll({
      search: query.search,
    });
  }

  async find(id: string) {
    const numericId = this.parseId(id);
    const found = await this.repo.findById(numericId);

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

  async update(id: string, input: UpdateExampleInput) {
    const numericId = this.parseId(id);

    const updated = await this.repo.update(numericId, {
      name: input.name,
      description: input.description,
    });

    if (!updated) {
      throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
    }

    return updated;
  }

  async delete(id: string) {
    const numericId = this.parseId(id);

    const deleted = await this.repo.delete(numericId);

    if (!deleted) {
      throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
    }
  }
}
