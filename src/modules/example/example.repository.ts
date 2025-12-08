import { appConfig } from "@/config/app";
import { db } from "@/core/database/connection";
import type { PaginatedResult, PaginationParams } from "@/shared/types/pagination";

import type { Example, ExampleId, ListExamplesFilter } from "./example.types";
import type { Prisma } from "@prisma/client";

export class ExampleRepository {
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

  async findById(id: ExampleId): Promise<Example | null> {
    return db().example.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(data: { name: string; description?: string | null }): Promise<Example> {
    return db().example.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
  }

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
