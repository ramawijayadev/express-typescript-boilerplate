import { z } from "zod";

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

export const FailedJobListSchema = z.object({
  jobs: z.array(FailedJobSchema),
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const CleanupResponseSchema = z.object({
  removedCount: z.number(),
  message: z.string(),
});
