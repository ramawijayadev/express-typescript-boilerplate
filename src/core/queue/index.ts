import { queueConfig } from "@/config/queue";
import { emailSender } from "@/core/mail";

import { BullmqJobQueue } from "./bullmq.queue";
import { InMemoryJobQueue } from "./memory.queue";

import type { JobQueue } from "./types";

export * from "./types";

/**
 * Singleton Instance Factory.
 * Automatically selects the implementation based on environment or config.
 */
export const jobQueue: JobQueue =
  process.env.NODE_ENV === "test" || queueConfig.redis.host === "memory"
    ? new InMemoryJobQueue(emailSender)
    : new BullmqJobQueue();
