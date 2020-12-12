import { Env } from "../../typing/env";
import { Ast } from "../ast";
import { Expr } from "./expr";
import { Type } from "./type";

export class ExprSequence extends Ast {
    constructor(
        readonly es: Expr[]
    ) {
        super();
    }

    show(indent: number) {
        return this.es.map(e => this.indentedLine(indent, e.show(indent))).join('');
    }

    typeInf(env: Env): Type {
        if (this.es.length === 0)
            throw new Error('Cannot infer type of empty expression sequence.');

        const ts = this.es.map(e => e.typeInf(env));
        return ts[ts.length - 1];
    }
}
