import { env } from "@/app/env";

/**
 * Mail server configuration (SMTP).
 */
export const mailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  from: env.SMTP_FROM,
};
