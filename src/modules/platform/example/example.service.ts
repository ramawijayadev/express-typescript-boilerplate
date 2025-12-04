import { StatusCodes } from "http-status-codes";

import { AppError } from "@/shared/errors/AppError";

import { ExampleRepository } from "./example.repository";

import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";
import type { ExampleId } from "./example.types";

export class ExampleService {
  constructor(private readonly repo = new ExampleRepository()) {}

  async list(query: ListExamplesQuery) {
    return this.repo.findAll({
      search: query.search,
    });
  }

  async find(id: number) {
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

  async update(id: number, input: UpdateExampleInput) {
    const updated = await this.repo.update(id, {
      name: input.name,
      description: input.description,
    });

    if (!updated) {
      throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
    }

    return updated;
  }

  async delete(id: number) {
    const deleted = await this.repo.delete(id);

    if (!deleted) {
      throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
    }
  }
}
