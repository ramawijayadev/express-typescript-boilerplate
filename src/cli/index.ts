import { Command } from "commander";
import { helloCommand } from "./commands/hello.command";

const program = new Command();

/**
 * CLI Entry Point.
 * Registers all available commands and parses arguments.
 */
program
  .name("app-cli")
  .description("CLI for the Express TypeScript Boilerplate")
  .version("1.0.0");

// Register commands
program.addCommand(helloCommand);

program.parse(process.argv);
