import { StatusCodes } from "http-status-codes";

import { AppError } from "@/shared/errors/AppError";

import { ExampleRepository } from "./example.repository";

import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";
import type { ExampleId } from "./example.types";

export class ExampleService {
  constructor(private readonly repo: ExampleRepository) {}

  async list(query: ListExamplesQuery) {
    return this.repo.findAll({ search: query.search }, { page: query.page, limit: query.limit });
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
    try {
      return await this.repo.update(id, {
        name: input.name,
        description: input.description,
      });
    } catch (error) {
      // P2025 is Prisma's "Record to update not found."
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).code === "P2025") {
        throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      await this.repo.delete(id);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).code === "P2025") {
        throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
      }
      throw error;
    }
  }
}
