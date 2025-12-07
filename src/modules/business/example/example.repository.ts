import { appConfig } from "@/config/app";
import { db } from "@/core/database/connection";
import type { Prisma } from "@/generated/prisma";
import type { PaginatedResult, PaginationParams } from "@/shared/types/pagination";

import type { Example, ExampleId, ListExamplesFilter } from "./example.types";

export class ExampleRepository {
  /**
   * Finds all examples matching the filter criteria and pagination options.
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
   */
  async create(data: { name: string; description?: string | null }): Promise<Example> {
    return db().example.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
  }

  /**
   * Updates an existing example in the database.
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
