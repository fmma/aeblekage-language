import { Expr } from "../expr";

export class Elambda extends Expr {
    constructor(
        readonly x: string,
        readonly e: Expr
    ) {
        super();
    }

    show(indent: number, precedence: number) {
        return this.parenthesis(`${this.x} => ${this.e.show(indent + 2, 0)}`, precedence >= 1);
    }
}
