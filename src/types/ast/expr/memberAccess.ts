import { Env } from "../../../typing/env";
import { Expr } from "../expr";
import { Type } from "../type";
import { Tapp } from "../type/app";
import { Tsymbol } from "../type/symbol";
import { Tvar } from "../type/var";

export class EmemberAccess extends Expr {
    constructor(
        readonly e: Expr,
        readonly x: string
    ) {
        super();
    }

    show(indent: number, precedence: number) {
        return this.parenthesis(`${this.e.show(indent, 1003)}.${this.x}`, precedence >= 1004);
    }

    typeInf(env: Env): Type {
        const t = this.e.typeInf(env);
        const tx = Tvar.fresh();
        env.unification.delayUnify(t, async instanceType => {
            const [f, ts] = matchInterfaceType(instanceType);
            const iface = await env.ifaces[f]?.instantiate(ts);
            if (iface == null)
                throw new Error(`Could not find interface ${f} in ${this.show(0, 0)}.`);
            const mt = iface.types[this.x];
            if (mt == null)
                throw new Error(`Interface ${f} does not have a member ${this.x}.`)
            env.unification.unify(mt.polytype().instantiate(), tx);
        });
        return tx;
    }
}

function matchInterfaceType(t: Type): [string, Type[]] {
    if (t instanceof Tapp) {
        const [f, ts] = matchInterfaceType(t.t1)
        ts.push(t.t2);
        return [f, ts];
    }
    if (t instanceof Tsymbol)
        return [t.name, []];
    throw new Error(`Could not infer interface type for ${t.show()}.`);
}
