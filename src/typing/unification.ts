import { Type } from "../types/ast/type";
import { resetFresh } from "./fresh";
import { Substitution } from "./substitution";

const _debugUnify = true;

export class Unification {
    globalSubst = new Substitution({});
    delayedUnifications = [] as [Type, (t0: Type) => Promise<void>][];

    constructor() {
        resetFresh();
    }

    delayUnify(t: Type, f: (t0: Type) => Promise<void>) {
        this.delayedUnifications.unshift([t, f]);
    }

    async end() {
        while (this.delayedUnifications.length > 0) {
            const [t, f] = this.delayedUnifications.pop() as [Type, (t0: Type) => Promise<void>];
            await f(t.substitute(this.globalSubst));
        }
    }

    unify(t1: Type, t2: Type): void {
        const ut1 = t1.unificationType;
        const ut2 = t2.unificationType;
        if (_debugUnify) {
            console.log(t1.show(), '=', t2.show());
        }
        if (ut1.type === 'var') {
            return this.unifyVar(ut1.value, t2);
        }
        if (ut2.type === 'var') {
            return this.unify(t2, t1);
        }
        if (ut1.name === ut2.name && ut1.args.length === ut2.args.length) {
            return this.unifyList(ut1.args, ut2.args)
        }
        throw this.unificationError(t1, t2);
    }

    unifyList(ts1: Type[], ts2: Type[]): void {
        for (let i = 0; i < ts1.length; ++i) {
            this.unify(ts1[i], ts2[i]);
        }
    }

    unifyVar(x: string, t2: Type) {
        if (t2.unificationType.type === 'var' && x === t2.unificationType.value)
            return;

        if (t2.freeVars().indexOf(x) !== -1)
            throw new Error(`Occurs check ${x} occurs in ` + t2.show());

        const t3 = this.globalSubst.subst[x];
        if (t3 != null)
            this.unify(t3, t2);

        this.globalSubst = this.globalSubst.substitute(new Substitution({ [x]: t2 }));
        this.globalSubst.subst[x] = t2;
    }

    unificationError(t1: Type, t2: Type): Error {
        return new Error(`Unification error ${t1.show()} = ${t2.show()}`);
    }
}
