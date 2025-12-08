import { Queue } from "bullmq";
import IORedis from "ioredis";

import { queueConfig } from "@/config/queue";
import { logger } from "@/core/logging/logger";

import type { JobQueue } from "./types";

/**
 * Redis-backed job queue implementation using BullMQ.
 * Recommended for production use.
 */
export class BullmqJobQueue implements JobQueue {
  private readonly emailQueue: Queue;
  private readonly deadLetterQueue: Queue;
  private readonly connection: IORedis;

  constructor() {
    this.connection = new IORedis({
      host: queueConfig.redis.host,
      port: Number(queueConfig.redis.port),
      maxRetriesPerRequest: null,
      ...(queueConfig.redis.password ? { password: queueConfig.redis.password } : {}),
    });

    this.emailQueue = new Queue("email-queue", {
      connection: this.connection,
      defaultJobOptions: queueConfig.defaultJobOptions,
    });

    this.deadLetterQueue = new Queue("dead-letter-queue", {
      connection: this.connection,
      defaultJobOptions: {
        removeOnComplete: {
          age: queueConfig.failedJobRetentionDays * 24 * 60 * 60,
        },
        removeOnFail: false,
      },
    });

    this.emailQueue.on("error", (err) => {
      logger.error({ err }, "BullMQ Error: Email Queue");
    });
  }

  async enqueueEmailVerification(data: {
    userId: number;
    email: string;
    token: string;
  }): Promise<void> {
    await this.emailQueue.add("verify-email", data);
    logger.info({ userId: data.userId, job: "verify-email" }, "Job Enqueued: Email Verification");
  }

  async enqueuePasswordReset(data: {
    userId: number;
    email: string;
    token: string;
  }): Promise<void> {
    await this.emailQueue.add("password-reset", data);
    logger.info({ userId: data.userId, job: "password-reset" }, "Job Enqueued: Password Reset");
  }

  getQueue(): Queue {
    return this.emailQueue;
  }

  getDeadLetterQueue(): Queue {
    return this.deadLetterQueue;
  }
}
