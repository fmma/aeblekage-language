import { Context } from "../../interp/context";
import { Env } from "../../typing/env";
import { Expr } from "../expr";
import { StmtExprItem } from "../stmtExprItem";
import { Type } from "../type";
import { Tfun } from "../type/fun";
import { Tvar } from "../type/var";

export class SEIapp extends StmtExprItem {
    constructor(
        readonly e: Expr
    ) {
        super();
    }

    typeInf(t1: Type, env: Env): Type {
        const t2 = this.e.typeInf(env);
        const tx = Tvar.fresh();
        env.unification.unify(t1, new Tfun(t2, tx));
        return tx;
    }

    interp(v: any, ctx: Context<any>): any {
        return v(this.e.interp(ctx));
    }

    show(indent: number) {
        return this.indentedLine(indent, this.e.show());
    }
}