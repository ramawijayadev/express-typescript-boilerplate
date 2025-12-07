import { env } from "@/app/env";

import { ConsoleEmailSender } from "./console.sender";
import { SmtpEmailSender } from "./smtp.sender";

import type { EmailSender } from "./types";

export * from "./types";

/**
 * Singleton Instance Factory.
 * Selects implementation based on Environment.
 * - Production: Uses SMTP Sender (Nodemailer)
 * - Test/Development: Uses Console Sender (Mock) to save resources
 */
export const emailSender: EmailSender =
  env.NODE_ENV === "production" || env.NODE_ENV === "test" // Use SMTP (Mailpit) for E2E/Integration tests
    ? new SmtpEmailSender()
    : new ConsoleEmailSender();
