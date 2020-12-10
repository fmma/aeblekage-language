import { Ast } from "../ast";
import { Expr } from "./expr";

export class ExprSequence extends Ast {
    constructor(
        readonly es: Expr[]
    ) {
        super();
    }

    show(indent: number) {
        return this.es.map(e => this.indentedLine(indent, e.show(indent))).join('');
    }
}
