import { Type } from "../ast/type";
import { Tvar } from "../ast/type/var";
import { Substitutable } from "./substitutable";

export class Substitution implements Substitutable<Substitution> {

    constructor(
        readonly subst: Record<string, Type | undefined>
    ) {
    }

    static fresh(params: string[]): Substitution {
        const subst: Record<string, Type | undefined> = {};
        params.forEach(p => {
            subst[p] = Tvar.fresh();
        });
        return new Substitution(subst);
    }

    static arbitrary(params: string[]): Substitution {
        const subst: Record<string, Type | undefined> = {};
        params.forEach(p => {
            subst[p] = Tvar.arbitrary();;
        });
        return new Substitution(subst);
    }

    unset(vars: string[]): Substitution {
        const ret = new Substitution({});
        Object.keys(this.subst).forEach(k => {
            if (vars.indexOf(k) === -1)
                ret.subst[k] = this.subst[k];
        });
        return ret;
    }

    substitute(subst: Substitution): Substitution {
        const ret = new Substitution({});
        Object.keys(this.subst).forEach(k => {
            const t = (this.subst[k] as Type).substitute(subst);
            if (t?.unificationType.type === 'var' && t.unificationType.value === k)
                delete ret.subst[k];
            else
                ret.subst[k] = t;
        });
        return ret;
    }

    freeVars(set: Set<string>) {
        Object.keys(this.subst).forEach(k => {
            this.subst[k]?.freeVars(set);
        });
    }
    show(): string {
        return Object.keys(this.subst)
            .map(x => `${x} => ${this.subst[x]?.show()}`)
            .join('\n');
    }
}