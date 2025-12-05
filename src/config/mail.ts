import { env } from "@/app/env";

export const mailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  from: env.SMTP_FROM,
};
