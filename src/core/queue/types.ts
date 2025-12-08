import { queueConfig } from "@/config/queue";

import type { Queue } from "bullmq";

export const defaultJobOptions = {
  attempts: queueConfig.defaultJobOptions.attempts,
  backoff: queueConfig.defaultJobOptions.backoff,
  removeOnComplete: queueConfig.defaultJobOptions.removeOnComplete,
  removeOnFail: queueConfig.defaultJobOptions.removeOnFail,
};

export interface EmailJobData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Interface defining the contract for job queue operations.
 * Allows switching between different implementations (Redis, Memory).
 */
export interface JobQueue {
  enqueueEmailVerification(data: { userId: number; email: string; token: string }): Promise<void>;
  enqueuePasswordReset(data: { userId: number; email: string; token: string }): Promise<void>;
  getQueue(): Queue;
  getDeadLetterQueue(): Queue;
}
