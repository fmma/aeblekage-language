import { FileIO } from "../../fileio";
import { CliArgs } from "../cliArgs";
import { Action } from "./action";

export class RunAction extends Action {
    go(fileIO: FileIO, fp: string, osFp: string, args: CliArgs): Promise<number> {
        throw new Error("Method not implemented.");
    }
}