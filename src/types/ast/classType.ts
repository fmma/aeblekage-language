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
    freeVars(set: Set<string>) {
        for (let param of this.params) {
            param.freeVars(set);
        }
    }
}