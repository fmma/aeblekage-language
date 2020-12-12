import { Instatiable } from "../../typing/instatiable";
import { Polytype } from "../../typing/polytype";
import { Substitutable } from "../../typing/substitutable";
import { Substitution } from "../../typing/substitution";
import { Ast } from "../ast";
import { Type } from "./type";
import { Tapp } from "./type/app";
import { Tfun } from "./type/fun";
import { Tsymbol } from "./type/symbol";
import { Tvar } from "./type/var";

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

    freeVars(): string[] {
        return this.value
            .freeVars()
            .filter(x => this.params.indexOf(x) === -1);
    }
}
