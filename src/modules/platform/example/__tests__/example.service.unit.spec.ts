import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/errors/AppError";

import { ExampleRepository } from "../example.repository";
import { ExampleService } from "../example.service";

describe("ExampleService", () => {
  const makeService = () => {
    const repo = new ExampleRepository();
    const service = new ExampleService(repo);
    return { service, repo };
  };

  it("should create example", async () => {
    const { service } = makeService();

    const result = await service.create({
      name: "Test example",
      description: "desc",
    });

    expect(result.id).toBeTypeOf("string");
    expect(result.name).toBe("Test example");
    expect(result.description).toBe("desc");
  });

  it("should list examples", async () => {
    const { service } = makeService();

    await service.create({ name: "A", description: null });
    await service.create({ name: "B", description: null });

    const result = await service.list({});

    expect(result.length).toBe(2);
  });

  it("should filter examples by search", async () => {
    const { service } = makeService();

    await service.create({ name: "Alpha", description: null });
    await service.create({ name: "Beta", description: null });

    const result = await service.list({ search: "alp" });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Alpha");
  });

  it("should get by id or throw AppError if not found", async () => {
    const { service } = makeService();
    const created = await service.create({ name: "Test", description: null });

    const found = await service.find(created.id);
    expect(found.id).toBe(created.id);

    await expect(service.find("non-existent")).rejects.toBeInstanceOf(AppError);
  });

  it("should update existing example", async () => {
    const { service } = makeService();
    const created = await service.create({ name: "Old", description: null });

    const updated = await service.update(created.id, { name: "New name" });

    expect(updated.name).toBe("New name");
  });

  it("should delete example or throw if not found", async () => {
    const { service } = makeService();
    const created = await service.create({ name: "To delete", description: null });

    await service.delete(created.id);

    await expect(service.find(created.id)).rejects.toBeInstanceOf(AppError);
  });
});
