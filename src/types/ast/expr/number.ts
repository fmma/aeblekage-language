import { Expr } from "../expr";
import { Type } from "../type";
import { Tsymbol } from "../type/symbol";

export class Enumber extends Expr {
    constructor(
        readonly value: number
    ) {
        super();
    }
    static type = new Tsymbol('number');

    show() {
        return String(this.value);
    }
    
    typeInf(): Type {
        return Enumber.type;
    }
}
