
import { env } from "@/app/env";
import { logger } from "@/core/logging/logger";
import { emailSender } from "@/core/mail/mailer";

import type { Job } from "bullmq";

interface EmailJobData {
  userId: number;
  email: string;
  token: string;
}

export const emailWorkerName = "email-queue";

export async function emailWorkerHandler(job: Job<EmailJobData>) {
  const { name, data } = job;

  logger.info({ jobId: job.id, jobName: name }, "Processing email job");

  try {
    switch (name) {
      case "verify-email":
        await sendVerificationEmail(data);
        break;
      case "password-reset":
        await sendPasswordResetEmail(data);
        break;
      default:
        logger.warn({ jobName: name }, "Unknown job name");
    }
  } catch (error) {
    logger.error({ error, jobId: job.id }, "Job processing failed");
    throw error;
  }
}

async function sendVerificationEmail(data: EmailJobData) {
  const url = `${env.FRONTEND_URL}/verify-email?token=${data.token}`;
  
  await emailSender.send({
    to: data.email,
    subject: "Verify your email address",
    html: `
      <p>Hello,</p>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${url}">${url}</a></p>
      <p>This link will expire in 24 hours.</p>
    `,
    text: `Please verify your email address: ${url}`,
  });
}

async function sendPasswordResetEmail(data: EmailJobData) {
  const url = `${env.FRONTEND_URL}/reset-password?token=${data.token}`;

  await emailSender.send({
    to: data.email,
    subject: "Reset your password",
    html: `
      <p>Hello,</p>
      <p>You requested a password reset. Click the link below to verify your email address and set a new password:</p>
      <p><a href="${url}">${url}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
    text: `Reset your password: ${url}`,
  });
}
