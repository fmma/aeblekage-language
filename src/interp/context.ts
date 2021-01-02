import { FileIO } from "../fileio";
import { Class } from "../ast/class/class";

export class Context<T> {
    constructor(
        readonly fileIO: FileIO,
        readonly env: Record<string, T | undefined>,
        readonly imports: Record<string, Class | undefined>
    ) {
    }

    get(x: string): T {
        const ret = this.env[x];
        if (ret == null)
            throw new Error('Unbound variable ' + x);
        return ret;
    }

    add(x: string, value: T): Context<T> {
        return new Context(this.fileIO, { ...this.env, [x]: value }, this.imports);
    }

    addAll(xts: [string, T][]) {
        const vs = {} as Record<string, T | undefined>;
        xts.map(([x, v]) => {
            vs[x] = v;
        });

        return new Context(this.fileIO, { ...this.env, ...vs }, this.imports);
    }

    show(): string {
        return Object.keys(this.env)
            .map(x => `${x} => ${this.env[x]}`)
            .join('\n') + '\nImports: ' + Object.keys(this.imports).join(',');
    }
}
