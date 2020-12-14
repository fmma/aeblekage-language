import { Substitution } from "../../../typing/substitution";
import { Type, UnificationType } from "../type";

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

    substitute(subst: Substitution): Type {
        return new Tapp(this.t1.substitute(subst), this.t2.substitute(subst));
    }

    freeVars(): string[] {
        return [...new Set([...this.t1.freeVars(), ...this.t2.freeVars()])];
    }

    unificationType = {
        type: 'cstr' as const,
        name: '@',
        args: [this.t1, this.t2]
    };

}
