import { Expr } from "../expr";

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
}
