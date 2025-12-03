import { randomUUID } from "node:crypto";

import type { Example, ExampleId, ListExamplesFilter } from "./example.types";

export class ExampleRepository {
  private items = new Map<ExampleId, Example>();

  async create(data: Omit<Example, "id" | "createdAt" | "updatedAt">): Promise<Example> {
    const now = new Date();
    const item: Example = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...data,
    };

    this.items.set(item.id, item);
    return item;
  }

  async findById(id: ExampleId): Promise<Example | null> {
    return this.items.get(id) ?? null;
  }

  async findAll(filter: ListExamplesFilter = {}): Promise<Example[]> {
    const all = Array.from(this.items.values());

    if (filter.search) {
      const q = filter.search.toLowerCase();
      return all.filter((item) => item.name.toLowerCase().includes(q));
    }

    return all;
  }

  async update(
    id: ExampleId,
    data: Partial<Omit<Example, "id" | "createdAt">>,
  ): Promise<Example | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: Example = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(id: ExampleId): Promise<boolean> {
    return this.items.delete(id);
  }
}
