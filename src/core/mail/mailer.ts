import nodemailer from "nodemailer";

import { mailConfig } from "@/config/mail";
import { logger } from "@/core/logging/logger";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

/**
 * Abstraction for Email Sending.
 */
export interface EmailSender {
  send(options: SendEmailOptions): Promise<void>;
}

/**
 * Nodemailer-based SMTP email sender.
 * Uses configuration from `config/mail`.
 */
export class SmtpEmailSender implements EmailSender {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host, // Replaced mailConfig.host
      port: mailConfig.port, // Replaced mailConfig.port
      auth: {
        user: mailConfig.user, // Replaced mailConfig.user
        pass: mailConfig.pass, // Replaced mailConfig.pass
      },
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: options.from || mailConfig.from, // Replaced mailConfig.from
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      logger.info({ to: options.to, subject: options.subject }, "Email sent successfully");
    } catch (error) {
      logger.error({ error, to: options.to }, "Failed to send email");
      throw error;
    }
  }
}

export class ConsoleEmailSender implements EmailSender {
  async send(options: SendEmailOptions): Promise<void> {
    logger.info(options, "Mock email sent");
  }
}

export const emailSender = new SmtpEmailSender();
