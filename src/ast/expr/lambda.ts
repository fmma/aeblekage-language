import { Context } from "../../interp/context";
import { Env } from "../../typing/env";
import { Expr } from "./expr";
import { Type } from "../type/type";
import { Tfun } from "../type/fun";
import { Tvar } from "../type/var";

export class Elambda extends Expr {
    constructor(
        readonly x: string,
        readonly e: Expr
    ) {
        super();
    }

    show(indent: number, precedence: number) {
        return this.parenthesis(`${this.x} => ${this.e.show(indent + 2, 4)}`, precedence >= 5);
    }

    typeInf(env: Env): Type {
        const tx = Tvar.fresh();
        return new Tfun(tx, this.e.typeInf(env.add(this.x, tx)));
    }

    interp(ctx: Context<any>): any {
        return (x: any) => this.e.interp(ctx.add(this.x, x));
    }
}
