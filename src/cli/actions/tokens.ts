import { promises } from 'fs';
import { Action } from "./action";
import { GoArgs } from './goArgs';

export class TokensAction extends Action {
    async go(goArgs: GoArgs): Promise<number | void> {
        const input = await promises.readFile(goArgs.osFp, "utf8");
        console.log('\n');
        const tokens = goArgs.services.indentTokenizer.sanitizeSrc(input);
        console.log(tokens);
        console.log('--');
        console.log(goArgs.services.indentTokenizer.recoverSanitizedSrc(tokens));
    }
}