import { exit } from "process";
import { Class } from "../../ast/class/class";
import { GoArgs } from "./goArgs";

export abstract class Action {
    abstract go(goArgs: GoArgs): Promise<number | void>

    async run(goArgs: GoArgs): Promise<void> {
        process.stdout.write(goArgs.path.join('.') + '...');
        const ret = await this.go(goArgs);
        if (ret === 0 || ret == null) {
            process.stdout.write(' OK\n');
            return;
        }
        process.stdout.write(' FAILED\n');
        exit(ret);
    }


    async mapGoClass<A>(goArgs: GoArgs, f: (cl: Class) => Promise<A> | A): Promise<A[]> {
        const classes = await goArgs.services.fileIO.requireImportPath(goArgs.path);
        return await Promise.all(classes.map(cl => f(cl)));
    }
}