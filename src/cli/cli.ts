import path from 'path';
import { exit } from 'process';
import { FileIO } from '../fileio';
import { _debugTurnOnAlwaysShowParethesis } from '../types/ast';
import { _debugTurnOnUnify } from '../typing/unification';
import { TokensAction } from './actions/tokens';
import { TypecheckAction } from './actions/typecheck';
import { CliArgs } from './cliArgs';

export class Cli {

    fileIO = new FileIO();

    async runClient(cliArgs: CliArgs) {
        if (cliArgs.debug) {
            _debugTurnOnAlwaysShowParethesis();
            _debugTurnOnUnify();
        }

        const args = cliArgs._.flatMap(x => typeof x === 'number' ? [] : [x]);
        if (args[0] == null)
            return;
        const fps = await this.fileIO.glob(args);
        for (let fp of fps) {
            if (path.extname(fp) === '.æ') {
                const path = fp.replace('.æ', '').split(/[\/\\]/).join('.');
                await this.runAeblekageFile(cliArgs, path, fp);
            }
        }
    }

    async runAeblekageFile(cliArgs: CliArgs, path: string, osFp: string) {
        try {
            if (cliArgs.tokens)
                return new TokensAction().go(this.fileIO, path, osFp, cliArgs);

            return await new TypecheckAction().go(this.fileIO, path, osFp, cliArgs);
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(cliArgs.dumpStackTraceOnError ? error : error.message);
                exit(1);
            }
            console.log(error);
            console.warn('Warning error was not an Error.');
            exit(1);
        }
    };
}
