import nodemailer from "nodemailer";

import { mailConfig } from "@/config/mail";
import { logger } from "@/core/logging/logger";

import { type EmailSender, type SendEmailOptions, defaultMailOptions } from "./types";

/**
 * Production-ready email sender using Nodemailer (SMTP).
 * Recommended for production usage.
 */
export class SmtpEmailSender implements EmailSender {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: options.from || defaultMailOptions.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      logger.info({ to: options.to, subject: options.subject }, "Email sent successfully (SMTP)");
    } catch (error) {
      logger.error({ error, to: options.to }, "Failed to send email (SMTP)");
      throw error;
    }
  }
}
