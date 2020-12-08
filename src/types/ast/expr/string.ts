import { Expr } from "../expr";

export class Estring extends Expr {
    constructor(
        readonly value: string
    ) {
        super();
    }

    show() {
        return `"${this.value}"`;
    }
}
