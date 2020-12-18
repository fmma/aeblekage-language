import { Env } from "../../../typing/env";
import { Expr } from "../expr";
import { Type } from "../type";

export class Eseq extends Expr {
    constructor(
        readonly e1: Expr,
        readonly e2: Expr
    ) {
        super();
    }

    show(indent: number) {
        return `${this.e1.show(indent)}; ${this.e2.show(indent)}`;
    }

    typeInf(env: Env): Type {
        this.e1.typeInf(env);
        return this.e2.typeInf(env);
    }
}
