import { FileIO } from "../fileio";
import { Class } from "../ast/class/class";
import { Type } from "../ast/type/type";
import { Polytype } from "./polytype";
import { Unification } from "./unification";

export class Env {
    constructor(
        readonly fileIO: FileIO,
        readonly env: Record<string, Polytype | undefined>,
        readonly imports: Record<string, Class | undefined>,
        readonly unification: Unification
    ) {
    }

    get(x: string): Type {
        const ret = this.env[x]?.instantiate();
        if (ret == null)
            throw new Error('Unbound variable ' + x);
        return ret;
    }

    add(x: string, t: Type | Polytype): Env {
        const pt = t instanceof Type ? new Polytype([], t) : t;
        return new Env(this.fileIO, { ...this.env, [x]: pt }, this.imports, this.unification);
    }

    addAll(xts: [string, Type | Polytype][]) {
        const xpts = {} as Record<string, Polytype | undefined>;
        xts.map(([x, t]) => {
            const pt = t instanceof Type ? new Polytype([], t) : t;
            xpts[x] = pt;
        });

        return new Env(this.fileIO, { ...this.env, ...xpts }, this.imports, this.unification);
    }

    show(): string {
        return Object.keys(this.env)
            .map(x => `${x} => ${this.env[x]?.show()}`)
            .join('\n') + '\nImports: ' + Object.keys(this.imports).join(',');
    }

    async getMemberType(instanceType: Type, memberName: string): Promise<Polytype> {
        try {
            const [f, ts] = instanceType.matchInterfaceType();
            const iface = this.imports[f]?.instantiate(ts);
            if (iface == null)
                throw new Error(`Could not find interface ${f}. Environment:${this.show()}`);
            const t = await iface.getType(this.fileIO, memberName);
            if (t == null)
                throw new Error(`Interface ${f} does not have a member ${memberName}.`)
            return t;
        } catch (error) {
            throw new Error(`Error in member access ${instanceType.show(2)}.${memberName}: ${error}.`)
        }
    }

    beginUnification(): Env {
        return new Env(this.fileIO, this.env, this.imports, new Unification());
    }
}
