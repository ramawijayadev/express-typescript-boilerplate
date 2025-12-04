import { db } from "@/core/database";
import type { Prisma } from "@/generated/prisma";

import type { Example, ExampleId, ListExamplesFilter } from "./example.types";

export class ExampleRepository {
  async findAll(filter: ListExamplesFilter = {}): Promise<Example[]> {
    const where: Prisma.ExampleWhereInput = {};

    if (filter.search) {
      where.name = {
        contains: filter.search,
        mode: "insensitive",
      };
    }

    return db().example.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: ExampleId): Promise<Example | null> {
    return db().example.findUnique({
      where: { id },
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
    return db()
      .example.update({
        where: { id },
        data,
      })
      .catch(() => null);
  }

  async delete(id: ExampleId): Promise<boolean> {
    return db()
      .example.delete({ where: { id } })
      .then(() => true)
      .catch(() => false);
  }
}
