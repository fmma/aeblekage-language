import { Substitution } from "./substitution";

export interface Substitutable<T> {
    substitute(subst: Substitution): T;
    freeVars(): string[];
}