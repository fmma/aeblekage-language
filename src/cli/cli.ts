import { requireAndTypeCheck } from '../typing/typing';

(async () => {
    try {
        const args = process.argv.slice(2);
        const x = await requireAndTypeCheck(args[0]);
        console.log(x);
    }
    catch (error) {
        if(error instanceof Error) {
            console.log(error.stack);
            return;
        }
        console.log(error);
        console.warn('Warning error was not an Error.');
    }
})();
