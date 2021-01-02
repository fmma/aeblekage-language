import { FileIO } from "../../fileio";
import { CliArgs } from "../cliArgs";

export interface GoArgs {
    fileIO: FileIO;
    path: string[];
    osFp: string;
    args: CliArgs;
}