import { appConfig } from "@/config/app";
import { db } from "@/core/database";
import type { Prisma } from "@/generated/prisma";
import type { PaginatedResult, PaginationParams } from "@/shared/types/pagination";

import type { Example, ExampleId, ListExamplesFilter } from "./example.types";

export class ExampleRepository {
  /**
   * Finds all examples matching the filter criteria and pagination options.
   *
   * @param filter - The filter criteria (e.g. search term).
   * @param pagination - The pagination parameters (page number and limit).
   * @returns A promise that resolves to a paginated result of examples.
   */
  async findAll(
    filter: ListExamplesFilter = {},
    pagination: PaginationParams = { page: 1, limit: appConfig.pagination.defaultLimit },
  ): Promise<PaginatedResult<Example>> {
    const where: Prisma.ExampleWhereInput = {
      deletedAt: null,
    };

    if (filter.search) {
      where.name = {
        contains: filter.search,
        mode: "insensitive",
      };
    }

    const [total, data] = await Promise.all([
      db().example.count({ where }),
      db().example.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  /**
   * Finds an example by its unique ID.
   *
   * @param id - The ID of the example to find.
   * @returns A promise that resolves to the example if found, or null otherwise.
   */
  async findById(id: ExampleId): Promise<Example | null> {
    return db().example.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Creates a new example in the database.
   *
   * @param data - The data for the new example.
   * @param data.name - The name of the example.
   * @param data.description - Optional description.
   * @returns A promise that resolves to the created example.
   */
  async create(data: { name: string; description?: string | null }): Promise<Example> {
    return db().example.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  /**
   * Updates an existing example in the database.
   *
   * @param id - The ID of the example to update.
   * @param data - The data to update.
   * @returns A promise that resolves to the updated example if found and updated, or null otherwise.
   */
  async update(
    id: ExampleId,
    data: { name?: string; description?: string | null },
  ): Promise<Example | null> {
    const { count } = await db().example.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });

    if (count === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Soft deletes an example by setting its deletedAt timestamp.
   *
   * @param id - The ID of the example to delete.
   * @returns A promise that resolves to true if the example was deleted, false otherwise.
   */
  async delete(id: ExampleId): Promise<boolean> {
    const { count } = await db().example.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    return count > 0;
  }
}
