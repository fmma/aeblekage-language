import { Substitutable } from "../../typing/substitutable";
import { Substitution } from "../../typing/substitution";
import { Ast } from "../ast";

export type UnificationType = { type: 'cstr', name: string, args: Type[] } | { type: 'var', value: string };

// t ::= a | t t | t -> t

// precedence
// app: 1 2     parens when >= 2  f a b    f (g a)
// fun: 1 -> 0  parens when >= 1  a->b->c  (a->b)->c
export abstract class Type extends Ast implements Substitutable<Type> {
    abstract substitute(subst: Substitution): Type;
    abstract freeVars(): string[];
    abstract unificationType: UnificationType;
}
