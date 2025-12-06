import type { CleanupResponseSchema, FailedJobListSchema, FailedJobSchema } from "./jobs.schemas";
import type { z } from "zod";

export type FailedJob = z.infer<typeof FailedJobSchema>;
export type FailedJobList = z.infer<typeof FailedJobListSchema>;
export type CleanupResponse = z.infer<typeof CleanupResponseSchema>;
