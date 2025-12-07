import { env } from "@/config/env";
import { logger } from "@/core/logging/logger";
import { emailSender } from "@/core/mail";
import { emailTemplates } from "@/shared/templates/emails";

import type { Job } from "bullmq";

interface EmailJobData {
  userId: number;
  email: string;
  token: string;
}

export const emailWorkerName = "email-queue";

export async function emailWorkerHandler(job: Job<EmailJobData>) {
  const { name, data } = job;

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
}

async function sendVerificationEmail(data: EmailJobData) {
  const url = `${env.FRONTEND_URL}/verify-email?token=${data.token}`;
  const template = emailTemplates.verification(url);

  await emailSender.send({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

async function sendPasswordResetEmail(data: EmailJobData) {
  const url = `${env.FRONTEND_URL}/reset-password?token=${data.token}`;
  const template = emailTemplates.passwordReset(url);

  await emailSender.send({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
