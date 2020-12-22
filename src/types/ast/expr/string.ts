import { Expr } from "../expr";
import { Type } from "../type";
import { Tsymbol } from "../type/symbol";

export class Estring extends Expr {
    constructor(
        readonly value: string
    ) {
        super();
    }

    static type = new Tsymbol('string');

    show() {
        return `"${this.value}"`;
    }

    typeInf(): Type {
        return Estring.type;
    }

    interp() {
        return this.value;
    }
}
