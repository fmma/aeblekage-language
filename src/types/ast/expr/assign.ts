import { Expr } from "../expr";

export class Eassign extends Expr {
    constructor(
        readonly varName: string,
        readonly e: Expr
    ) {
        super();
    }


    show(indent: number, precedence: number) {
        return this.parenthesis(`${this.varName} = ${this.e.show(indent + 2, 2)}`, precedence >= 3);
    }
}
