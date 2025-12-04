import { db } from "@/core/database";
import type { Prisma } from "@/generated/prisma";

import type { Example, ExampleId, ListExamplesFilter } from "./example.types";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ExampleRepository {
  async findAll(
    filter: ListExamplesFilter = {},
    pagination: PaginationParams = { page: 1, limit: 10 },
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
        description: data.description,
      },
    });
  }

  async update(
    id: ExampleId,
    data: { name?: string; description?: string | null },
  ): Promise<Example | null> {
    return db().example.update({
      where: { id },
      data,
    });
  }

  async delete(id: ExampleId): Promise<void> {
    await db().example.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
