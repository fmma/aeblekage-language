import { promises } from 'fs';
import { FileIO } from "../../fileio";
import { recoverSanitizedSrc, sanitizeSrc } from "../../parser/indentTokenizer";
import { CliArgs } from "../cliArgs";
import { Action } from "./action";

export class TokensAction extends Action {
    async go(fileIO: FileIO, fp: string, osFp: string, args: CliArgs): Promise<number> {
        const input = await promises.readFile(osFp, "utf8");
        console.log('\n');
        const tokens = sanitizeSrc(input);
        console.log(tokens);
        console.log('--');
        console.log(recoverSanitizedSrc(tokens));
        return 0;
    }

}