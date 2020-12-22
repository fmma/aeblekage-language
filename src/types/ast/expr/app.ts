import { Context } from "../../../interp/context";
import { Env } from "../../../typing/env";
import { Expr } from "../expr";
import { Type } from "../type";
import { Tfun } from "../type/fun";
import { Tvar } from "../type/var";

export class Eapp extends Expr {
    constructor(
        readonly e1: Expr,
        readonly e2: Expr
    ) {
        super();
    }

    show(indent: number, precedence: number) {
        return this.parenthesis(`${this.e1.show(indent, 1001)} ${this.e2.show(indent, 1002)}`, precedence >= 1002);
    }

    typeInf(env: Env): Type {
        const t1 = this.e1.typeInf(env);
        const t2 = this.e2.typeInf(env);
        const tx = Tvar.fresh();
        env.unification.unify(t1, new Tfun(t2, tx));
        return tx;
    }

    interp(ctx: Context<any>): any {
        const f = this.e1.interp(ctx);
        const v = this.e2.interp(ctx);
        return f(v);
    }
}
