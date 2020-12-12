import { fresh } from "../../../typing/fresh";
import { Substitution } from "../../../typing/substitution";
import { Type } from "../type";

export class Tvar extends Type {
    constructor(
        readonly name: string
    ) {
        super();
    }

    static fresh() {
        return new Tvar(fresh());
    }

    show() {
        return this.name;
    }

    substitute(subst: Substitution): Type {
        return subst.subst[this.name] ?? this;
    }

    freeVars(): string[] {
        return [this.name];
    }
}
