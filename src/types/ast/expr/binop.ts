import { Binop } from "../../../binops";
import { Context } from "../../../interp/context";
import { Env } from "../../../typing/env";
import { Expr } from "../expr";
import { Type } from "../type";
import { Tfun } from "../type/fun";
import { Tvar } from "../type/var";

export class Ebinop extends Expr {
    constructor(
        readonly e1: Expr,
        readonly binop: Binop,
        readonly e2: Expr
    ) {
        super();
    }

    show(indent: number, precedence: number) {
        return this.parenthesis([
            this.e1.show(indent, this.binop.leftSubPrecedence),
            this.binop.symbol,
            this.e2.show(indent, this.binop.rightSubPrecedence)
        ].join(' '), precedence >= this.binop.precedence);
    }

    typeInf(env: Env): Type {
        const t1 = this.e1.typeInf(env);
        const t2 = this.e2.typeInf(env);
        const tx = Tvar.fresh();

        env.unification.delayUnify(t1, async instanceType => {
            const mt = await env.getMemberType(instanceType, this.binop.symbol);
            env.unification.unify(mt.instantiate(), new Tfun(t2, tx));
        });

        return tx;
    }

    interp(ctx: Context<any>): any {
        return this.e1.interp(ctx)[this.binop.symbol](this.e2.interp(ctx));
    }
}
