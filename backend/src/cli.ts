/**
 * Main entrypoint for CLI commands in the NEST environment.
 */

import { CommandFactory } from "nest-commander";
import { CliModule } from "./cli.module";

async function bootstrap() {
  await CommandFactory.run(CliModule, ["warn", "error", "log"]);
}

void bootstrap();
