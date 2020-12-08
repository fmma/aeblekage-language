import { Expr } from "../expr";

export class Evar extends Expr {
    constructor(
        readonly name: string
    ) {
        super();
    }

    show() {
        return this.name;
    }
}
