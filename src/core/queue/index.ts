import { Queue } from "bullmq";
import IORedis from "ioredis";

import { queueConfig } from "@/config/queue";
import { logger } from "@/core/logging/logger";
import { type EmailSender } from "@/core/mail/mailer";

export interface EmailJobData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

// Separate interfaces for specific job types if needed, but for now generic email is fine for the worker
// However, the abstraction requested specific methods.

export interface JobQueue {
  enqueueEmailVerification(data: { userId: number; email: string; token: string }): Promise<void>;
  enqueuePasswordReset(data: { userId: number; email: string; token: string }): Promise<void>;
}

export class BullmqJobQueue implements JobQueue {
  private emailQueue: Queue;

  constructor() {
    const connection = new IORedis({
      host: queueConfig.redis.host,
      port: queueConfig.redis.port,
      password: queueConfig.redis.password,
      maxRetriesPerRequest: null,
    });

    this.emailQueue = new Queue("email-queue", {
      connection,
      defaultJobOptions: queueConfig.defaultJobOptions,
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

  async enqueuePasswordReset(data: { userId: number; email: string; token: string }): Promise<void> {
    await this.emailQueue.add("password-reset", data);
    logger.info({ userId: data.userId, type: "password-reset" }, "Enqueued password reset job");
  }

  getQueue(): Queue {
    return this.emailQueue;
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
    // Directly call the logic that the worker would do.
    // Ideally we shouldn't duplicate logic, but for simple test/dev this is fine.
    // Or we could trigger the handler.
    // For now, let's just log it or maybe send a mock email.
    await this.emailService.send({
      to: data.email,
      subject: "Verify your email",
      text: `Token: ${data.token}`, // Simplified
    });
  }

  async enqueuePasswordReset(data: { userId: number; email: string; token: string }): Promise<void> {
    logger.info({ userId: data.userId }, "Processing in-memory password reset");
    await this.emailService.send({
      to: data.email,
      subject: "Reset your password",
      text: `Token: ${data.token}`, // Simplified
    });
  }
}

export const jobQueue = new BullmqJobQueue();
