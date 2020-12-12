import { Type } from "../types/ast/type";
import { Tsymbol } from "../types/ast/type/symbol";
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

    symbolicate() {
        const st = new Substitution({});
        this.params.forEach(a => {
            st.subst[a] = new Tsymbol(`$${a}`);
        });
        return this.monotype.substitute(st);
    }

    substitute(subst: Substitution): Polytype {
        return new Polytype(this.params, this.monotype.substitute(subst.unset(this.params)));
    }

    freeVars(): string[] {
        return this.monotype
            .freeVars()
            .filter(x => this.params.indexOf(x) === -1);
    }

    show() {
        if (this.params.length == 0) {
            return this.monotype.show();
        }
        return `forall ${this.params.join(' ')}. ${this.monotype.show()}`;
    }
}