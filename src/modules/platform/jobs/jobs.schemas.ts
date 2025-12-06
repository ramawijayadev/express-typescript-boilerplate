import { z } from "zod";

/**
 * Schema for a single failed job in the Dead Letter Queue.
 */
export const FailedJobSchema = z.object({
  id: z.string(),
  jobName: z.string(),
  originalQueue: z.string(),
  originalJobId: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
  error: z.string(),
  errorStack: z.string().optional(),
  failedAt: z.string().datetime(),
  attemptsMade: z.number(),
  timestamp: z.number().optional(),
});

/**
 * Schema for listing failed jobs with pagination metadata.
 */
export const FailedJobListSchema = z.object({
  jobs: z.array(FailedJobSchema),
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

/**
 * Schema for cleanup response.
 */
export const CleanupResponseSchema = z.object({
  removedCount: z.number(),
  message: z.string(),
});
