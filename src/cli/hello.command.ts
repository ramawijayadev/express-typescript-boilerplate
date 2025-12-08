import { Command } from "commander";

import { logger } from "@/core/logging/logger";

interface HelloOptions {
  name: string;
}

export const helloCommand = new Command("hello")
  .description("Prints a hello message")
  .option("-n, --name <name>", "Name to greet", "World")
  .action((options: HelloOptions) => {
    logger.info(`Hello, ${options.name}!`);
  });
