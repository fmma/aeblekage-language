import { Substitutable } from "../../typing/substitutable";
import { Substitution } from "../../typing/substitution";
import { Ast } from "../ast";
import { Type } from "./type";

export class ClassType extends Ast implements Substitutable<ClassType> {
    constructor(
        readonly name: string,
        readonly params: Type[]
    ) {
        super();
    }
    substitute(subst: Substitution): ClassType {
        return new ClassType(
            this.name,
            this.params.map(t => t.substitute(subst))
        );
    }
    freeVars(): string[] {
        return [...new Set(this.params.flatMap(a => a.freeVars()))];
    }
}