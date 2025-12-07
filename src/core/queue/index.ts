import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

import { queueConfig } from "@/config/queue";
import { logger } from "@/core/logging/logger";
import { type EmailSender } from "@/core/mail/mailer";

const connection = {
  host: queueConfig.redis.host,
  port: queueConfig.redis.port,
  password: queueConfig.redis.password,
};

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

export interface JobQueue {
  enqueueEmailVerification(data: { userId: number; email: string; token: string }): Promise<void>;
  enqueuePasswordReset(data: { userId: number; email: string; token: string }): Promise<void>;
}

export class BullmqJobQueue implements JobQueue {
  private emailQueue: Queue;
  private deadLetterQueue: Queue;
  private connection: IORedis;

  constructor() {
    const redisOpts = {
      host: queueConfig.redis.host,
      port: Number(queueConfig.redis.port),
      maxRetriesPerRequest: null,
    };
    // Proper handling for exactOptionalPropertyTypes
    if (queueConfig.redis.password) {
      Object.assign(redisOpts, { password: queueConfig.redis.password });
    }

    this.connection = new IORedis(redisOpts);

    this.emailQueue = new Queue("email-queue", {
      connection: this.connection,
      defaultJobOptions: queueConfig.defaultJobOptions,
    });

    this.deadLetterQueue = new Queue("dead-letter-queue", {
      connection: this.connection,
      defaultJobOptions: {
        removeOnComplete: {
          age: queueConfig.failedJobRetentionDays * 24 * 60 * 60, // Convert days to seconds
        },
        removeOnFail: false,
      },
    });
  }

  async enqueueEmailVerification(data: {
    userId: number;
    email: string;
    token: string;
  }): Promise<void> {
    await this.emailQueue.add("verify-email", data);
    logger.info({ userId: data.userId, type: "verify-email" }, "Enqueued email verification job");
  }

  async enqueuePasswordReset(data: {
    userId: number;
    email: string;
    token: string;
  }): Promise<void> {
    await this.emailQueue.add("password-reset", data);
    logger.info({ userId: data.userId, type: "password-reset" }, "Enqueued password reset job");
  }

  getQueue(): Queue {
    return this.emailQueue;
  }

  getDeadLetterQueue(): Queue {
    return this.deadLetterQueue;
  }
}

// In-memory queue for testing or local dev without Redis if needed
export class InMemoryJobQueue implements JobQueue {
  constructor(private emailService: EmailSender) {}

  async enqueueEmailVerification(data: {
    userId: number;
    email: string;
    token: string;
  }): Promise<void> {
    logger.info({ userId: data.userId }, "Processing in-memory email verification");
    await this.emailService.send({
      to: data.email,
      subject: "Verify your email",
      text: `Token: ${data.token}`,
    });
  }

  async enqueuePasswordReset(data: {
    userId: number;
    email: string;
    token: string;
  }): Promise<void> {
    logger.info({ userId: data.userId }, "Processing in-memory password reset");
    await this.emailService.send({
      to: data.email,
      subject: "Reset your password",
      text: `Token: ${data.token}`,
    });
  }
}

export const jobQueue = new BullmqJobQueue();
