import { Binop } from "../../../binops";
import { Expr } from "../expr";

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
}
