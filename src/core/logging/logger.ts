import pino from "pino";
import { appConfig } from "@/config/app";

export const logger = pino({
  level: appConfig.env === "production" ? "info" : "debug",
  transport:
    appConfig.env === "development"
      ? {
          target: "pino-pretty",
          options: {
            translateTime: true,
            colorize: true,
          },
        }
      : undefined,
});
