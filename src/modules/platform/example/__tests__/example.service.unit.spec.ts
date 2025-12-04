import { StatusCodes } from "http-status-codes";
import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/errors/AppError";

import { ExampleRepository } from "../example.repository";
import { ExampleService } from "../example.service";

describe("Example service (unit)", () => {
  const makeService = () => {
    const repo = new ExampleRepository();
    const service = new ExampleService(repo);
    return { service, repo };
  };

  describe("list", () => {
    it("should return empty array when no examples exist", async () => {
      const { service } = makeService();

      const result = await service.list({});

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should return all examples when no filter is provided", async () => {
      const { service } = makeService();

      await service.create({ name: "A", description: null });
      await service.create({ name: "B", description: null });

      const result = await service.list({});

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name).sort()).toEqual(["A", "B"]);
    });

    it("should filter examples by search term", async () => {
      const { service } = makeService();

      await service.create({ name: "Alpha", description: null });
      await service.create({ name: "Beta", description: null });

      const result = await service.list({ search: "alp" });

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("Alpha");
    });

    it("should return empty array when no examples match search", async () => {
      const { service } = makeService();

      await service.create({ name: "Alpha", description: null });
      await service.create({ name: "Beta", description: null });

      const result = await service.list({ search: "zzz" });

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe("find", () => {
    it("should return example by id when it exists", async () => {
      const { service } = makeService();

      const created = await service.create({ name: "Test", description: null });

      const found = await service.find(created.id);

      expect(found.id).toBe(created.id);
      expect(found.name).toBe("Test");
    });

    it("should throw AppError 404 when example is not found", async () => {
      const { service } = makeService();

      const promise = service.find("non-existent-id");

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Example not found",
      });
    });
  });

  describe("create", () => {
    it("should create example with given name and description", async () => {
      const { service } = makeService();

      const result = await service.create({
        name: "Test example",
        description: "desc",
      });

      expect(result.id).toBeTypeOf("string");
      expect(result.name).toBe("Test example");
      expect(result.description).toBe("desc");
    });

    it("should allow null description", async () => {
      const { service } = makeService();

      const result = await service.create({
        name: "No desc",
        description: null,
      });

      expect(result.name).toBe("No desc");
      expect(result.description).toBeNull();
    });
  });

  describe("update", () => {
    it("should update existing example", async () => {
      const { service } = makeService();

      const created = await service.create({ name: "Old", description: null });

      const updated = await service.update(created.id, {
        name: "New name",
        description: "updated desc",
      });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe("New name");
      expect(updated.description).toBe("updated desc");
    });

    it("should allow clearing description to null", async () => {
      const { service } = makeService();

      const created = await service.create({
        name: "With desc",
        description: "initial",
      });

      const updated = await service.update(created.id, {
        name: "With desc",
        description: null,
      });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe("With desc");
      expect(updated.description).toBeNull();
    });

    it("should throw AppError 404 when updating non-existent example", async () => {
      const { service } = makeService();

      const promise = service.update("non-existent-id", {
        name: "New name",
        description: null,
      });

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Example not found",
      });
    });
  });

  describe("delete", () => {
    it("should delete existing example", async () => {
      const { service } = makeService();

      const created = await service.create({ name: "To delete", description: null });

      await service.delete(created.id);

      await expect(service.find(created.id)).rejects.toBeInstanceOf(AppError);
    });

    it("should throw AppError 404 when deleting non-existent example", async () => {
      const { service } = makeService();

      const promise = service.delete("non-existent-id");

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Example not found",
      });
    });
  });
});
