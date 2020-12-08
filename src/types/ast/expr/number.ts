import { Expr } from "../expr";

export class Enumber extends Expr {
    constructor(
        readonly value: number
    ) {
        super();
    }

    show() {
        return String(this.value);
    }
}
