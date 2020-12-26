import { promises } from 'fs';
import { requireAndTypeCheck, _debugTurnTyping } from '../typing/typing';
import path from 'path';
import { glob } from '../fileio';
import { exit } from 'process';
import yargs from 'yargs';
import { _debugAlwaysShowParethesis, _debugTurnOnAlwaysShowParethesis } from '../types/ast';
import { _debugTurnOnUnify } from '../typing/unification';
import { recoverSanitizedSrc, sanitizeSrc } from '../parser/indentTokenizer';

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
    .option('tokens', {
        type: 'boolean'
    })
    .argv;

async function go(fp: string, osFp: string) {
    try {
        process.stdout.write(fp + '... ');
        if (argz.tokens) {
            const input = await promises.readFile(osFp, "utf8");
            console.log('\n');
            const tokens = sanitizeSrc(input);
            console.log(tokens);
            console.log('--');
            console.log(recoverSanitizedSrc(tokens));
        }
        else
            await requireAndTypeCheck(fp);
        process.stdout.write('OK\n');

    }
    catch (error) {
        if (error instanceof Error) {
            console.log(argz.dumpStackTraceOnError ? error : error.message);
            exit(1);
        }
        console.log(error);
        console.warn('Warning error was not an Error.');
        exit(1);
    }
};

(async () => {
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
            await go(path, fp);
        }
    }
})();
