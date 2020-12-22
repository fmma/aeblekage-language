import { Env } from "../../../typing/env";
import { Expr } from "../expr";
import { StmtExprItem } from "../stmtExprItem";
import { Type } from "../type";
import { Tvar } from "../type/var";
import { matchInterfaceType } from '../expr/memberAccess';
import { Tfun } from "../type/fun";
import { Context } from "../../../interp/context";

export class SEIchain extends StmtExprItem {

    constructor(
        readonly x: string,
        readonly es: Expr[]
    ) {
        super();
    }

    show(indent: number) {
        return this.indentedLine(indent, `.${[this.x, this.es.map(e => e.show(indent, 1002))].join(' ')}`);
    }

    interp(v: any, ctx: Context<any>): any {
        this.es.reduce((v, e) => v(e.interp(ctx)), v[this.x]);
    }

    typeInf(t: Type, env: Env): Type {
        const tx = Tvar.fresh();
        env.unification.delayUnify(t, async instanceType => {
            const [f, ts] = matchInterfaceType(instanceType);
            const iface = await env.imports[f]?.instantiate(ts);
            if (iface == null)
                throw new Error(`Could not find interface ${f} in ${this.show(0)}. Environment:${env.show()}`);
            const mt = iface.types[this.x];
            if (mt == null)
                throw new Error(`Interface ${f} does not have a member ${this.x}.`)
            env.unification.unify(mt.polytype().instantiate(), tx);
        });
        return this.es.reduce((t1, e) => {
            const t2 = e.typeInf(env);
            const tx = Tvar.fresh();
            env.unification.unify(t1, new Tfun(t2, tx));
            return tx;
        }, tx);
    }
}
