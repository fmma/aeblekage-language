import { Ast } from "../ast";
import { Expr } from "./expr";
import { ExprSequence } from "./exprSequence";

export class Member extends Ast {
    constructor(
        readonly name: string,
        readonly args: string[],
        readonly value: ExprSequence
    ) {
        super();
    }

    show(indent: number) {
        return this.indentedLine(indent, [this.name, ...this.args].join(' ')) + this.value.show(indent + 2);
    }
}
