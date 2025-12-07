import { mailConfig } from "@/config/mail";

export const defaultMailOptions = {
  from: mailConfig.from,
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

/**
 * Interface defining the contract for Email operations.
 * Allows switching between different providers (SMTP, Console, SES, etc).
 */
export interface EmailSender {
  send(options: SendEmailOptions): Promise<void>;
}
