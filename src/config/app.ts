import { env } from "@/app/env";

export const appConfig = {
  env: env.NODE_ENV,
  port: env.APP_PORT,
  basePath: env.APP_BASE_PATH,
};
