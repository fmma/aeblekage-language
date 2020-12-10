import { Expr } from "../expr";

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
}
