import { Interface } from "../types/ast/interface";
import { Type } from "../types/ast/type";
import { Polytype } from "./polytype";
import { Unification } from "./unification";

export class Env {
    constructor(
        readonly env: Record<string, Polytype | undefined>,
        readonly ifaces: Record<string, Interface | undefined>,
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
        return new Env({ ...this.env, [x]: pt }, this.ifaces, this.unification);
    }

    addAll(xts: [string, Type | Polytype][]) {
        const xpts = {} as Record<string, Polytype | undefined>;
        xts.map(([x, t]) => {
            const pt = t instanceof Type ? new Polytype([], t) : t;
            xpts[x] = pt;
        });

        return new Env({ ...this.env, ...xpts }, this.ifaces, this.unification);
    }

    show(): string {
        return Object.keys(this.env)
            .map(x => `${x} => ${this.env[x]?.show()}`)
            .join('\n') + '\nInterfaces: ' + Object.keys(this.ifaces).join(',');
    }
}