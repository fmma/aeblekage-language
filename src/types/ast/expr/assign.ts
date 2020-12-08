import { Expr } from "../expr";

export class Eassign extends Expr {
    constructor(
        readonly varName: string,
        readonly e: Expr
    ) {
        super();
    }

    show() {
        return `${this.varName} = ${this.e.show()}`;
    }
}
