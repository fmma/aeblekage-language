import { Expr } from "../expr";

export class Ebinop extends Expr {
    constructor(
        readonly e1: Expr,
        readonly name: string,
        readonly e2: Expr,
        readonly leftPrec: number,
        readonly rightPrec: number
    ) {
        super();
    }

    show(indent: number, precedence: number) {
        return this.parenthesis([
            this.e1.show(indent, this.leftPrec),
            this.name,
            this.e2.show(indent, this.rightPrec)
        ].join(' '), precedence >= Math.max(this.leftPrec, this.rightPrec));
    }
}
