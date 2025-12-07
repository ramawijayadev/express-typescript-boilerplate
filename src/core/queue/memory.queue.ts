import { logger } from "@/core/logging/logger";
import { type EmailSender } from "@/core/mail/mailer";

import type { JobQueue } from "./types";

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
        text: `Token: ${data.token}`,
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
        text: `Token: ${data.token}`,
      });
    }
  }
}
