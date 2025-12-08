/**
 * Unit tests for ExampleService.
 */
import { StatusCodes } from "http-status-codes";
import { describe, expect, it, vi } from "vitest";

import { AppError } from "@/shared/errors/AppError";

import { ExampleRepository } from "../example.repository";
import { ExampleService } from "../example.service";

vi.mock("../example.repository");

describe("Example service (unit)", () => {
  const makeService = () => {
    const repo = new ExampleRepository();

    repo.findAll = vi.fn();
    repo.findById = vi.fn();
    repo.create = vi.fn();
    repo.update = vi.fn();
    repo.delete = vi.fn();

    const service = new ExampleService(repo);
    return { service, repo };
  };

  describe("list", () => {
    it("should return empty array when no examples exist", async () => {
      const { service, repo } = makeService();
      vi.mocked(repo.findAll).mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.data).toEqual([]);
    });

    it("should return all examples when no filter is provided", async () => {
      const { service, repo } = makeService();
      const mockData = [
        {
          id: 1,
          name: "A",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          createdBy: null,
          updatedBy: null,
          deletedBy: null,
        },
        {
          id: 2,
          name: "B",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          createdBy: null,
          updatedBy: null,
          deletedBy: null,
        },
      ];
      vi.mocked(repo.findAll).mockResolvedValue({
        data: mockData,
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
      });

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(mockData);
    });

    it("should pass search filter to repository", async () => {
      const { service, repo } = makeService();
      vi.mocked(repo.findAll).mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      await service.list({ search: "alp", page: 1, limit: 10 });

      expect(repo.findAll).toHaveBeenCalledWith({ search: "alp" }, { page: 1, limit: 10 });
    });
  });

  describe("find", () => {
    it("should return example by id when it exists", async () => {
      const { service, repo } = makeService();
      const mockData = {
        id: 1,
        name: "Test",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
      };
      vi.mocked(repo.findById).mockResolvedValue(mockData);

      const found = await service.find(1);

      expect(found).toEqual(mockData);
    });

    it("should throw AppError 404 when example is not found", async () => {
      const { service, repo } = makeService();
      vi.mocked(repo.findById).mockResolvedValue(null);

      const promise = service.find(999);

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Example not found",
      });
    });
  });

  describe("create", () => {
    it("should create example with given name and description", async () => {
      const { service, repo } = makeService();
      const input = { name: "Test example", description: "desc" };
      const mockData = {
        id: 1,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
      };
      vi.mocked(repo.create).mockResolvedValue(mockData);

      const result = await service.create(input);

      expect(repo.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockData);
    });
  });

  describe("update", () => {
    it("should update existing example", async () => {
      const { service, repo } = makeService();
      const input = { name: "New name", description: "updated desc" };
      const mockData = {
        id: 1,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
      };
      vi.mocked(repo.update).mockResolvedValue(mockData);

      const updated = await service.update(1, input);

      expect(repo.update).toHaveBeenCalledWith(1, input);
      expect(updated).toEqual(mockData);
    });

    it("should throw AppError 404 when updating non-existent example", async () => {
      const { service, repo } = makeService();
      vi.mocked(repo.update).mockResolvedValue(null);

      const promise = service.update(999, {
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
      const { service, repo } = makeService();
      vi.mocked(repo.delete).mockResolvedValue(true);

      await service.delete(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it("should throw AppError 404 when deleting non-existent example", async () => {
      const { service, repo } = makeService();
      vi.mocked(repo.delete).mockResolvedValue(false);

      const promise = service.delete(999);

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Example not found",
      });
    });
  });
});
