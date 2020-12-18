import { Env } from "../../../typing/env";
import { Expr } from "../expr";
import { Type } from "../type";

export class Elet extends Expr {
    constructor(
        readonly x: string,
        readonly e1: Expr,
        readonly e2: Expr
    ) {
        super();
    }

    show(indent: number) {
        return `${this.x} = ${this.e1.show(indent)}; ${this.e2.show(indent)}`;
    }

    typeInf(env: Env): Type {
        const t1 = this.e1.typeInf(env);
        return this.e2.typeInf(env.add(this.x, t1));
    }
}