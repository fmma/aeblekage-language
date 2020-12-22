import { Type } from "../types/ast/type";
import { resetFresh } from "./fresh";
import { Substitution } from "./substitution";

let _debugUnify = false;
export function _debugTurnOnUnify() {
    _debugUnify = true;
}

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

    unify(type1: Type, type2: Type): void {
        const stack = [[type1, type2]];
        while (stack.length > 0) {
            const [t1, t2] = stack.pop()!;
            const ut1 = t1.unificationType;
            const ut2 = t2.unificationType;
            if (_debugUnify) {
                console.log(t1.show(), '=', t2.show());
            }
            if (ut1.type === 'var') {
                this.unifyVar(ut1.value, t2);
            }
            else if (ut2.type === 'var') {
                this.unify(t2, t1);
            }
            else if (ut1.name === ut2.name && ut1.args.length === ut2.args.length) {
                for (let i = 0; i < ut1.args.length; ++i) {
                    stack.push([ut1.args[i], ut2.args[i]]);
                }
            }
            else
                throw this.unificationError(type1, type2, t1, t2);
        }
    }

    unifyList(ts1: Type[], ts2: Type[]): void {
        for (let i = 0; i < ts1.length; ++i) {
            this.unify(ts1[i], ts2[i]);
        }
    }

    unifyVar(x: string, t2: Type) {
        if (t2.unificationType.type === 'var' && x === t2.unificationType.value)
            return;

        if (t2.occurs(x))
            throw new Error(`Occurs check ${x} occurs in ` + t2.show());

        const t3 = this.globalSubst.subst[x];
        if (t3 != null)
            this.unify(t3, t2);

        this.globalSubst = this.globalSubst.substitute(new Substitution({ [x]: t2 }));
        this.globalSubst.subst[x] = t2;
    }

    unificationError(type1: Type, type2: Type, t1: Type, t2: Type): Error {
        return new Error(`Unification error ${t1.show()} != ${t2.show()} in the unification of:\n${type1.show()}   with:\n${type2.show()}`);
    }
}
