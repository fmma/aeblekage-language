import { requireAndTypeCheck, _debugTurnTyping } from '../typing/typing';
import path from 'path';
import { glob } from '../fileio';
import { exit } from 'process';
import yargs from 'yargs';
import { _debugAlwaysShowParethesis, _debugTurnOnAlwaysShowParethesis } from '../types/ast';
import { _debugTurnOnUnify } from '../typing/unification';

async function go(args: { dumpStackTraceOnError: boolean | undefined }, fp: string) {
    try {
        process.stdout.write(fp + '... ');
        const x = await requireAndTypeCheck(fp);
        process.stdout.write('OK\n');

    }
    catch (error) {
        if (error instanceof Error) {
            console.log(args.dumpStackTraceOnError ? error : error.message);
            exit(1);
        }
        console.log(error);
        console.warn('Warning error was not an Error.');
        exit(1);
    }
};

(async () => {
    const argz = yargs(process.argv.slice(2))
        .option('debug', {
            alias: 'd',
            type: 'boolean',
            description: 'Turn on debug info'
        })
        .option('dumpStackTraceOnError', {
            alias: 's',
            type: 'boolean'
        })
        .argv;
    if (argz.debug) {
        _debugTurnOnAlwaysShowParethesis();
        _debugTurnOnUnify();
        _debugTurnTyping();
    }

    const args = argz._.flatMap(x => typeof x === 'number' ? [] : [x]);
    if (args[0] == null)
        return;
    const fps = await glob(args);
    for (let fp of fps) {
        if (path.extname(fp) === '.æ') {
            const path = fp.replace('.æ', '').split(/[\/\\]/).join('.');
            await go(argz, path);
        }
    }
})();
