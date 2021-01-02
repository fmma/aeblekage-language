import { Env } from "../../typing/env";
import { Expr } from "../expr/expr";
import { StmtExprItem } from "./stmtExprItem";
import { Type } from "../type/type";
import { Tvar } from "../type/var";
import { Tfun } from "../type/fun";
import { Context } from "../../interp/context";

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
            const mt = await env.getMemberType(instanceType, this.x);
            env.unification.unify(mt.instantiate(), tx);
        });
        return this.es.reduce((t1, e) => {
            const t2 = e.typeInf(env);
            const tx = Tvar.fresh();
            env.unification.unify(t1, new Tfun(t2, tx));
            return tx;
        }, tx);
    }
}
