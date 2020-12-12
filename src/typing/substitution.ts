import { Type } from "../types/ast/type";
import { Tvar } from "../types/ast/type/var";
import { fresh } from "./fresh";
import { Substitutable } from "./substitutable";

export class Substitution implements Substitutable<Substitution> {

    constructor(
        readonly subst: Record<string, Type | undefined>
    ) {
    }

    static fresh(params: string[]): Substitution {
        const subst: Record<string, Type | undefined> = {};
        params.forEach(p => {
            subst[p] = new Tvar(fresh());
        })
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
            ret.subst[k] = this.subst[k]?.substitute(subst);
        });
        return ret;
    }

    freeVars(): string[] {
        const ret: string[] = [];
        Object.keys(this.subst).forEach(k => {
            this.subst[k]?.freeVars().forEach(x => {
                ret.push(x);
            });
        });
        return [... new Set(ret)];
    }
    show(): string {
        return Object.keys(this.subst)
            .map(x => `${x} => ${this.subst[x]?.show()}`)
            .join('\n');
    }
}