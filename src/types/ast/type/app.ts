import { Type } from "../type";

export class Tapp extends Type {
    constructor(
        readonly t1: Type,
        readonly t2: Type
    ) {
        super();
    }

    // precedence
    // app: 1 2     parens when >= 2  f a b    f (g a)
    // fun: 1 -> 0  parens when >= 1  a->b->c  (a->b)->c
    show(indent: number, precedence: number) {
        return this.parenthesis(`${this.t1.show(indent, 1)} ${this.t2.show(indent, 2)}`, precedence >= 2);
    }
}
