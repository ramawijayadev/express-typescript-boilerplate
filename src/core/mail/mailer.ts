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

export interface EmailSender {
  send(options: SendEmailOptions): Promise<void>;
}

export class SmtpEmailSender implements EmailSender {
  private transporter: nodemailer.Transporter;

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
        from: options.from || mailConfig.from,
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
