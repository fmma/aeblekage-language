import { Expr } from "../expr";
import { Type } from "../type";
import { Tsymbol } from "../type/symbol";

export class Ebool extends Expr {
    constructor(
        readonly value: boolean
    ) {
        super();
    }

    static type = new Tsymbol('bool');

    show() {
        return `"${this.value}"`;
    }

    typeInf(): Type {
        return Ebool.type;
    }
}