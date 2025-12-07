import { logger } from "@/core/logging/logger";

import type { EmailSender, SendEmailOptions } from "./types";

/**
 * Development email sender that logs to console instead of sending real emails.
 * Useful for local development and testing to avoid spamming real inboxes.
 */
export class ConsoleEmailSender implements EmailSender {
  async send(options: SendEmailOptions): Promise<void> {
    logger.info(
      {
        to: options.to,
        subject: options.subject,
        payload: {
          text: options.text,
          // html content is excluded to keep logs clean
        },
      },
      "[Mock Mailer] Email simulation",
    );
  }
}
