import path from 'path';
import { exit } from 'process';
import { _debugTurnOnAlwaysShowParethesis } from '../ast/ast';
import { _debugTurnOnUnify } from '../typing/unification';
import { TokensAction } from './actions/tokens';
import { TypecheckAction } from './actions/typecheck';
import { CliArgs } from './cliArgs';
import { Services } from './services';

export class Cli {

    constructor(readonly services: Services) { }

    async runClient(cliArgs: CliArgs) {
        if (cliArgs.debug) {
            _debugTurnOnAlwaysShowParethesis();
            _debugTurnOnUnify();
        }

        const args = cliArgs._.flatMap(x => typeof x === 'number' ? [] : [x]);
        if (args[0] == null)
            return;
        const fps = await this.services.fileIO.glob(args);
        for (let fp of fps) {
            if (path.extname(fp) === '.æ') {
                const path = fp.replace('.æ', '').split(/[\/\\]/).join('.');
                await this.runAeblekageFile(cliArgs, path.split('.'), fp);
            }
        }
    }

    async runAeblekageFile(cliArgs: CliArgs, path: string[], osFp: string) {
        const goArgs = {
            services: this.services,
            path: path,
            osFp: osFp,
            args: cliArgs
        }
        try {
            if (cliArgs.tokens)
                return new TokensAction().run(goArgs);

            return await new TypecheckAction().run(goArgs);
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
