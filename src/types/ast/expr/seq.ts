import { Expr } from "../expr";

export class Eseq extends Expr {
    constructor(
        readonly es: Expr[]
    ) {
        super();
    }

    show(indent: number) {
        return this.es.map(e => e.show(indent)).join("\n" + " ".repeat(indent));
    }
}
