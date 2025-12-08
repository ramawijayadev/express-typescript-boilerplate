import { logger } from "@/core/logging/logger";
import { type EmailSender } from "@/core/mail";

import type { JobQueue } from "./types";
import type { Queue } from "bullmq";

/**
 * In-memory job queue implementation.
 * Useful for testing and local development without Redis.
 */
export class InMemoryJobQueue implements JobQueue {
  constructor(private readonly emailService?: EmailSender) {}

  async enqueueEmailVerification(data: {
    userId: number;
    email: string;
    token: string;
  }): Promise<void> {
    logger.info({ userId: data.userId }, "[InMemory] Processing email verification");

    if (this.emailService) {
      await this.emailService.send({
        to: data.email,
        subject: "Verify your email",
        text: `Please verify your email here: https://example.com/verify?token=${data.token}`,
      });
    }
  }

  async enqueuePasswordReset(data: {
    userId: number;
    email: string;
    token: string;
  }): Promise<void> {
    logger.info({ userId: data.userId }, "[InMemory] Processing password reset");

    if (this.emailService) {
      await this.emailService.send({
        to: data.email,
        subject: "Reset your password",
        text: `Reset your password here: https://example.com/reset-password?token=${data.token}`,
      });
    }
  }

  getQueue(): Queue {
    throw new Error("Method 'getQueue' is not supported in In-Memory mode. Use Redis driver.");
  }

  getDeadLetterQueue(): Queue {
    throw new Error(
      "Method 'getDeadLetterQueue' is not supported in In-Memory mode. Use Redis driver.",
    );
  }
}
