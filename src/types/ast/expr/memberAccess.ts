import { Context } from "../../../interp/context";
import { Env } from "../../../typing/env";
import { Polytype } from "../../../typing/polytype";
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
        env.unification.delayUnify(t, async t0 => {
            const mt = await env.getMemberType(t0, this.x);
            env.unification.unify(mt.instantiate(), tx);
        });
        return tx;
    }

    interp(ctx: Context<any>): any {
        return this.e.interp(ctx)[this.x];
    }
}
