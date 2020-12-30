import { Cli } from "./cli";
import { CliArgsClass } from "./cliArgs";

new Cli().runClient(new CliArgsClass().cliArgs);