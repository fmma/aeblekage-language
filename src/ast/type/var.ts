import { fresh } from "../../typing/fresh";
import { Substitution } from "../../typing/substitution";
import { Type } from "./type";
import { Tsymbol } from "./symbol";

export class Tvar extends Type {
    constructor(
        readonly name: string
    ) {
        super();
    }

    static fresh() {
        return new Tvar(fresh());
    }

    static arbitrary() {
        return new Tsymbol(fresh());
    }

    show() {
        return this.name;
    }

    substitute(subst: Substitution): Type {
        return subst.subst[this.name] ?? this;
    }

    freeVars(set: Set<string>) {
        set.add(this.name);
    }

    unificationType = {
        type: 'var' as const,
        value: this.name
    };

    matchInterfaceType(): [string, Type[]] {
        throw new Error(`Could not deduce interface type from type variable: ${this.show()}.`);
    }
}
