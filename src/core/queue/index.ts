import { queueConfig } from "@/config/queue";

import { BullmqJobQueue } from "./bullmq.queue";
import { InMemoryJobQueue } from "./memory.queue";

import type { JobQueue } from "./types";

export * from "./types";

/**
 * Factory to select the appropriate job queue implementation.
 * Uses InMemoryJobQueue for testing or if configured, otherwise BullmqJobQueue.
 */
export const jobQueue: JobQueue =
  process.env.NODE_ENV === "test" || queueConfig.redis.host === "memory"
    ? new InMemoryJobQueue()
    : new BullmqJobQueue();
