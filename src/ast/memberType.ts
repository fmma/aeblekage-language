import { Polytype } from "../typing/polytype";
import { Substitutable } from "../typing/substitutable";
import { Substitution } from "../typing/substitution";
import { Ast } from "./ast";
import { Type } from "./type";

export class MemberType extends Ast implements Substitutable<MemberType> {
    constructor(
        readonly name: string,
        readonly params: string[],
        readonly value: Type
    ) {
        super();
    }

    polytype(): Polytype {
        return new Polytype(this.params, this.value);
    }

    show(indent: number) {
        return this.indentedLine(indent, `${[this.name, ...this.params].join(' ')} : ${this.value.show()}`);
    }

    substitute(subst: Substitution): MemberType {
        return new MemberType(this.name, this.params, this.value.substitute(subst.unset(this.params)));
    }

    freeVars(set: Set<string>) {
        this.value.freeVars(set);
        for (let param of this.params) {
            set.delete(param);
        }
    }
}
