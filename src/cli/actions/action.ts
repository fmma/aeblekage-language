import { FileIO } from "../../fileio";
import { CliArgs } from "../cliArgs";

export abstract class Action {
    abstract go(fileIO: FileIO, fp: string, osFp: string, args: CliArgs): Promise<number>
}