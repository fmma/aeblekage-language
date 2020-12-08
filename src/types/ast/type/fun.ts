import { Type } from "../type";

export class Tfun extends Type {
    constructor(
        readonly t1: Type,
        readonly t2: Type
    ) {
        super();
    }

    show(indent: number, precedence: number) {
        return this.parenthesis(`${this.t1.show(indent, 1)} -> ${this.t2.show(indent, 0)}`, precedence >= 1);
    }
}
