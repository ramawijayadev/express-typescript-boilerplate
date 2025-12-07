import { Command } from "commander";

import { helloCommand } from "./commands/hello.command";
import { jwtGenerateCommand } from "./commands/jwt-generate.command";

const program = new Command();

program.name("app-cli").description("CLI for the Express TypeScript Boilerplate").version("1.0.0");

program.addCommand(helloCommand);
program.addCommand(jwtGenerateCommand);

program.parse(process.argv);
