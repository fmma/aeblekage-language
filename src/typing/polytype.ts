import { Type } from "../ast/type/type";
import { Instatiable } from "./instatiable";
import { Substitutable } from "./substitutable";
import { Substitution } from "./substitution";

export class Polytype implements Substitutable<Polytype>, Instatiable<Type> {
    constructor(
        readonly params: string[],
        readonly monotype: Type
    ) {
    }

    instantiate() {
        return this.monotype.substitute(Substitution.fresh(this.params));
    }

    instantiateArbitrary() {
        return this.monotype.substitute(Substitution.arbitrary(this.params));
    }

    substitute(subst: Substitution): Polytype {
        return new Polytype(this.params, this.monotype.substitute(subst.unset(this.params)));
    }

    freeVars(set: Set<string>) {
        this.monotype.freeVars(set);
        for (let param of this.params) {
            set.delete(param);
        }
    }

    isClosed() {
        const set = new Set<string>();
        this.freeVars(set);
        return set.size === 0;
    }

    show() {
        if (this.params.length == 0) {
            return this.monotype.show();
        }
        return `forall ${this.params.join(' ')}. ${this.monotype.show()}`;
    }
}