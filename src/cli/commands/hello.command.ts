import { Command } from "commander";

export const helloCommand = new Command("hello")
  .description("Prints a hello message")
  .option("-n, --name <name>", "Name to greet", "World")
  .action((options) => {
    console.log(`Hello, ${options.name}!`);
  });
