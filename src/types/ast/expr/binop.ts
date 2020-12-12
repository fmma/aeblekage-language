import { Binop } from "../../../binops";
import { Env } from "../../../typing/env";
import { unify } from "../../../typing/unification";
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
        const t3 = this.binop.type.instantiate();
        const tx = Tvar.fresh();
        unify(t3, new Tfun(t1, new Tfun(t2, tx)));
        return tx;
    }
}
