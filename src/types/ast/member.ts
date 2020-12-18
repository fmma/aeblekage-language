import { Env } from "../../typing/env";
import { Substitutable } from "../../typing/substitutable";
import { Ast } from "../ast";
import { ExprSequence } from "./exprSequence";
import { Type } from "./type";
import { Tfun } from "./type/fun";
import { Tvar } from "./type/var";

export class Member extends Ast implements Substitutable<Member> {
    constructor(
        readonly name: string,
        readonly args: string[],
        readonly value: ExprSequence
    ) {
        super();
    }

    show(indent: number) {
        return this.indentedLine(indent, `${[this.name, ...this.args].join(' ')} = ${this.value.show(indent + 2)}`);
    }

    typeInf(env: Env): Type {
        const ts = this.args.map(x => [x, Tvar.fresh()] as [string, Type]);
        const env0 = env.addAll(ts);
        const t = this.value.typeInf(env0);
        return ts.reduceRight((t, ti) => new Tfun(ti[1], t), t);
    }


    substitute(): Member {
        return this;
    }

    freeVars(): string[] {
        return [];
    }
}
