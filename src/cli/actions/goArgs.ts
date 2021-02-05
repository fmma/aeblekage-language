import { Services } from "../services";
import { CliArgs } from "../cliArgs";

export interface GoArgs {
    services: Services;
    path: string[];
    osFp: string;
    args: CliArgs;
}