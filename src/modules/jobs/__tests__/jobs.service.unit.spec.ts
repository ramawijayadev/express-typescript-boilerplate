import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/shared/errors/AppError";

import { JobsService } from "../jobs.service";

import type { JobsRepository } from "../jobs.repository";
import type { Job } from "bullmq";

describe("JobsService", () => {
  let service: JobsService;
  let mockRepo: JobsRepository;

  beforeEach(() => {
    mockRepo = {
      getFailedJobs: vi.fn(),
      getFailedJobById: vi.fn(),
      retryJob: vi.fn(),
      removeJob: vi.fn(),
      cleanupOldJobs: vi.fn(),
    } as unknown as JobsRepository;

    service = new JobsService(mockRepo);
  });

  describe("listFailedJobs", () => {
    it("should list all failed jobs", async () => {
      const mockJobs: Partial<Job>[] = [
        {
          id: "1",
          timestamp: Date.now(),
          data: {
            jobName: "verify-email",
            originalQueue: "email-queue",
            originalJobId: "original-1",
            data: { userId: 1, email: "test@example.com", token: "token123" },
            error: "SMTP connection failed",
            errorStack: "Error: SMTP...",
            failedAt: new Date().toISOString(),
            attemptsMade: 3,
          },
        },
        {
          id: "2",
          timestamp: Date.now(),
          data: {
            jobName: "password-reset",
            originalQueue: "email-queue",
            data: { userId: 2, email: "user@example.com", token: "reset456" },
            error: "Email send timeout",
            failedAt: new Date().toISOString(),
            attemptsMade: 3,
          },
        },
      ];

      vi.mocked(mockRepo.getFailedJobs).mockResolvedValue(mockJobs as Job[]);

      const result = await service.listFailedJobs();

      expect(result.total).toBe(2);
      expect(result.jobs).toHaveLength(2);
      expect(result.jobs[0]?.id).toBe("1");
      expect(result.jobs[0]?.jobName).toBe("verify-email");
      expect(result.jobs[1]?.id).toBe("2");
      expect(mockRepo.getFailedJobs).toHaveBeenCalledTimes(1);
    });

    it("should return empty list when no failed jobs", async () => {
      vi.mocked(mockRepo.getFailedJobs).mockResolvedValue([]);

      const result = await service.listFailedJobs();

      expect(result.total).toBe(0);
      expect(result.jobs).toHaveLength(0);
    });
  });

  describe("retryFailedJob", () => {
    it("should retry a failed job", async () => {
      const mockJob: Partial<Job> = {
        id: "1",
        data: {
          jobName: "verify-email",
          originalQueue: "email-queue",
          data: { userId: 1, email: "test@example.com", token: "token123" },
          error: "Connection timeout",
          failedAt: new Date().toISOString(),
          attemptsMade: 3,
        },
      };

      vi.mocked(mockRepo.getFailedJobById).mockResolvedValue(mockJob as Job);
      vi.mocked(mockRepo.retryJob).mockResolvedValue();

      await service.retryFailedJob("1");

      expect(mockRepo.getFailedJobById).toHaveBeenCalledWith("1");
      expect(mockRepo.retryJob).toHaveBeenCalledWith(mockJob);
    });

    it("should throw 404 error when job not found", async () => {
      vi.mocked(mockRepo.getFailedJobById).mockResolvedValue(null);

      await expect(service.retryFailedJob("999")).rejects.toThrow(AppError);
      await expect(service.retryFailedJob("999")).rejects.toMatchObject({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Failed job not found",
      });

      expect(mockRepo.retryJob).not.toHaveBeenCalled();
    });
  });

  describe("removeFailedJob", () => {
    it("should remove a failed job", async () => {
      const mockJob: Partial<Job> = {
        id: "1",
        data: {
          jobName: "verify-email",
          originalQueue: "email-queue",
          data: {},
          error: "Test error",
          failedAt: new Date().toISOString(),
          attemptsMade: 3,
        },
      };

      vi.mocked(mockRepo.getFailedJobById).mockResolvedValue(mockJob as Job);
      vi.mocked(mockRepo.removeJob).mockResolvedValue();

      await service.removeFailedJob("1");

      expect(mockRepo.getFailedJobById).toHaveBeenCalledWith("1");
      expect(mockRepo.removeJob).toHaveBeenCalledWith(mockJob);
    });

    it("should throw 404 error when job not found", async () => {
      vi.mocked(mockRepo.getFailedJobById).mockResolvedValue(null);

      await expect(service.removeFailedJob("999")).rejects.toThrow(AppError);
      await expect(service.removeFailedJob("999")).rejects.toMatchObject({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Failed job not found",
      });

      expect(mockRepo.removeJob).not.toHaveBeenCalled();
    });
  });

  describe("cleanupOldFailedJobs", () => {
    it("should cleanup old failed jobs and return count", async () => {
      vi.mocked(mockRepo.cleanupOldJobs).mockResolvedValue(5);

      const result = await service.cleanupOldFailedJobs();

      expect(result.removedCount).toBe(5);
      expect(result.message).toBe("Removed 5 old failed job(s)");
      expect(mockRepo.cleanupOldJobs).toHaveBeenCalledTimes(1);
    });

    it("should return zero when no old jobs to cleanup", async () => {
      vi.mocked(mockRepo.cleanupOldJobs).mockResolvedValue(0);

      const result = await service.cleanupOldFailedJobs();

      expect(result.removedCount).toBe(0);
      expect(result.message).toBe("Removed 0 old failed job(s)");
    });
  });
});
