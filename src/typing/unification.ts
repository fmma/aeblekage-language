import { Type } from "../types/ast/type";
import { Tapp } from "../types/ast/type/app";
import { Tfun } from "../types/ast/type/fun";
import { Tsymbol } from "../types/ast/type/symbol";
import { Tvar } from "../types/ast/type/var";
import { resetFresh } from "./fresh";
import { Substitution } from "./substitution";

let globalSubst = new Substitution({});
let delayedUnifications = [] as [Type, (t0: Type) => void][];


export function delayUnify(t: Type, f: (t0: Type) => void) {
    delayedUnifications.push([t, f]);
}

export function beginUnification<T>(runner: () => T): [T, Substitution] {

    globalSubst = new Substitution({});
    delayedUnifications = [];
    resetFresh();

    const t = runner();

    while (delayedUnifications.length > 0) {
        const [t, f] = delayedUnifications.pop() as [Type, (t0: Type) => void];
        f(t.substitute(globalSubst));
    }

    return [t, globalSubst];
}

const _debugUnify = true;

export function unify(t1: Type, t2: Type) {
    if(_debugUnify) {
        console.log(t1.show(), '=', t2.show());
    }
    if (t1 instanceof Tvar) {

        if (_debugUnify) {
            console.log('!!');
            console.log(globalSubst.show());
        }
        if (t2.freeVars().indexOf(t1.name) !== -1)
            throw new Error(`Occurs check ${t1.name} occurs in ` + t2.show());
        const t3 = globalSubst.subst[t1.name];
        if (t3 != null) {
            unify(t3, t2);
        }
        globalSubst = globalSubst.substitute(new Substitution({ [t1.name]: t2 }));
        globalSubst.subst[t1.name] = t2;
        if (_debugUnify) {
            console.log('->');
            console.log(globalSubst.show());
        }
        return;
    }
    if (t2 instanceof Tvar) {
        unify(t2, t1);
        return;
    }
    if (t1 instanceof Tsymbol && t2 instanceof Tsymbol && t1.name === t2.name) {
        return;
    }
    if (t1 instanceof Tapp && t2 instanceof Tapp ||
        t1 instanceof Tfun && t2 instanceof Tfun) {
        unify(t1.t1, t2.t1);
        unify(t1.t2, t2.t2);
        return;
    }
    throw unificationError(t1, t2);
}

function unificationError(t1: Type, t2: Type): Error {
    return new Error(`Unification error ${t1.show()} = ${t2.show()}`);
}