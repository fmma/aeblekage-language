import { FileIO } from "../../fileio";
import { CliArgs } from "../cliArgs";
import { Action } from "./action";

export class TypecheckAction extends Action {
    async go(fileIO: FileIO, fp: string, osFp: string, args: CliArgs): Promise<number> {
        process.stdout.write(fp + '...');
        const ret = await this.requireAndTypeCheck(fileIO, fp);
        if (ret === 0)
            process.stdout.write(' OK\n');
        else
            process.stdout.write(' FAILED\n');
        return ret;
    }

    async requireAndTypeCheck(fileIO: FileIO, path: string) {
        const classes = await fileIO.requireImportPath(path.split('.') ?? []);
        await Promise.all(classes.map(t => t.typeCheck(fileIO)));
        return 0;
    }

}