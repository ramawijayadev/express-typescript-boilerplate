import { env } from "@/app/env";

export const queueConfig = {
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: env.QUEUE_JOB_ATTEMPTS,
    backoff: {
      type: "exponential",
      delay: env.QUEUE_JOB_BACKOFF_DELAY,
    },
    removeOnComplete: env.QUEUE_JOB_REMOVE_ON_COMPLETE,
    removeOnFail: env.QUEUE_JOB_REMOVE_ON_FAIL,
  },
  failedJobRetentionDays: env.QUEUE_FAILED_JOB_RETENTION_DAYS,
  failedJobAlertThreshold: env.QUEUE_FAILED_JOB_ALERT_THRESHOLD,
};
