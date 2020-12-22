import { Substitution } from "./substitution";

export interface Substitutable<T> {
    substitute(subst: Substitution): T;
    freeVars(set: Set<string>): void;
}