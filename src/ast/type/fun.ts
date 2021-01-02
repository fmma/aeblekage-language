import { Substitution } from "../../typing/substitution";
import { Type } from "./type";

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

    substitute(subst: Substitution): Type {
        return new Tfun(this.t1.substitute(subst), this.t2.substitute(subst));
    }

    freeVars(set: Set<string>) {
        this.t1.freeVars(set);
        this.t2.freeVars(set);
    }

    unificationType = {
        type: 'cstr' as const,
        name: '->',
        args: [this.t1, this.t2]
    };

    matchInterfaceType(): [string, Type[]] {
        throw new Error(`Function type is not an interface: ${this.show(0, 0)}.`);
    }
}
