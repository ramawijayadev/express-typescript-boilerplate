import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { Command } from "commander";

import { logger } from "@/core/logging/logger";

export const jwtGenerateCommand = new Command("jwt:generate")
  .description("Generate and rotate JWT secrets in .env")
  .action(() => {
    try {
      const envPath = path.join(process.cwd(), ".env");

      if (!fs.existsSync(envPath)) {
        logger.error(".env file not found");
        process.exit(1);
      }

      const envContent = fs.readFileSync(envPath, "utf-8");

      const jwtSecret = crypto.randomBytes(64).toString("hex");
      const jwtRefreshSecret = crypto.randomBytes(64).toString("hex");

      fs.writeFileSync(`${envPath}.bak`, envContent);

      let newEnvContent = envContent;

      if (newEnvContent.includes("JWT_SECRET=")) {
        newEnvContent = newEnvContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${jwtSecret}`);
      } else {
        newEnvContent += `\nJWT_SECRET=${jwtSecret}`;
      }

      if (newEnvContent.includes("JWT_REFRESH_SECRET=")) {
        newEnvContent = newEnvContent.replace(
          /JWT_REFRESH_SECRET=.*/g,
          `JWT_REFRESH_SECRET=${jwtRefreshSecret}`,
        );
      } else {
        newEnvContent = newEnvContent.replace(
          /(JWT_SECRET=.*)/,
          `$1\nJWT_REFRESH_SECRET=${jwtRefreshSecret}`,
        );
      }

      fs.writeFileSync(envPath, newEnvContent);

      logger.info("✅ JWT Secrets rotated. Added JWT_REFRESH_SECRET for better security.");
    } catch (error) {
      logger.error(error, "Failed to generate JWT secrets");
      process.exit(1);
    }
  });
