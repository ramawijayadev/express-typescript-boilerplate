import { StatusCodes } from "http-status-codes";

import { AppError } from "@/shared/errors/AppError";

import type { ExampleRepository } from "./example.repository";
import type { CreateExampleInput, ListExamplesQuery, UpdateExampleInput } from "./example.schemas";
import type { ExampleId } from "./example.types";

export class ExampleService {
  /**
   * Creates an instance of ExampleService.
   * @param repo - The example repository.
   */
  constructor(private readonly repo: ExampleRepository) {}

  /**
   * Lists all examples with pagination and optional search.
   *
   * @param query - The query parameters for listing examples.
   * @param query.search - Optional search term to filter examples by name.
   * @param query.page - The page number for pagination.
   * @param query.limit - The number of items per page.
   * @returns A promise that resolves to a paginated result of examples.
   */
  async list(query: ListExamplesQuery) {
    const filter: { search?: string } = {};
    if (query.search) {
      filter.search = query.search;
    }
    return this.repo.findAll(filter, { page: query.page ?? 1, limit: query.limit ?? 10 });
  }

  /**
   * Finds a specific example by its ID.
   *
   * @param id - The ID of the example to retrieve.
   * @returns A promise that resolves to the found example.
   * @throws {AppError} 404 - If the example is not found.
   */
  async find(id: ExampleId) {
    const found = await this.repo.findById(id);

    if (!found) {
      throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
    }

    return found;
  }

  /**
   * Creates a new example.
   *
   * @param input - The data to create the example.
   * @param input.name - The name of the example.
   * @param input.description - Optional description of the example.
   * @returns A promise that resolves to the created example.
   */
  async create(input: CreateExampleInput) {
    return this.repo.create({
      name: input.name,
      description: input.description ?? null,
    });
  }

  /**
   * Updates an existing example.
   *
   * @param id - The ID of the example to update.
   * @param input - The data to update the example.
   * @param input.name - The new name of the example.
   * @param input.description - The new description of the example.
   * @returns A promise that resolves to the updated example.
   * @throws {AppError} 404 - If the example is not found.
   */
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

  /**
   * Deletes an example by its ID (soft delete).
   *
   * @param id - The ID of the example to delete.
   * @returns A promise that resolves when the operation is complete.
   * @throws {AppError} 404 - If the example is not found.
   */
  async delete(id: ExampleId) {
    const deleted = await this.repo.delete(id);

    if (!deleted) {
      throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
    }
  }
}
