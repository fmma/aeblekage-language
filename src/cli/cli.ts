import { requireAndTypeCheck } from '../typing/typing';
import path from 'path';
import { glob } from '../fileio';

async function go(fp: string) {
    try {
        const x = await requireAndTypeCheck(fp);
        console.log(x);
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            return;
        }
        console.log(error);
        console.warn('Warning error was not an Error.');
    }
};

(async () => {
    const args = process.argv.slice(2);
    if (args[0] == null)
        return;
    const fps = await glob(args);
    for (let fp of fps) {
        if (path.extname(fp) === '.æ') {
            const path = fp.replace('.æ', '').split(/[\/\\]/).join('.');
            console.log(path);
            await go(path);
        }
    }
})()
