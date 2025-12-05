import { env } from "@/app/env";

export const loggingConfig = {
  level: env.LOG_LEVEL,
  driver: env.LOG_DRIVER,
  filePath: env.LOG_FILE_PATH,
  errorReporting: env.ERROR_REPORTING,

  // Computed helpers
  isProduction: env.NODE_ENV === "production",
  isDevelopment: env.NODE_ENV === "development",
};
