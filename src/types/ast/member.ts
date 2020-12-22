import { Context } from "../../interp/context";
import { Env } from "../../typing/env";
import { Substitutable } from "../../typing/substitutable";
import { Ast } from "../ast";
import { Stmt } from "./stmt";
import { Type } from "./type";
import { Tfun } from "./type/fun";
import { Tvar } from "./type/var";

export class Member extends Ast implements Substitutable<Member> {
    constructor(
        readonly name: string,
        readonly args: string[],
        readonly value: Stmt
    ) {
        super();
    }

    show(indent: number) {
        return this.indentedLine(indent, `${[this.name, ...this.args].join(' ')} = ${this.value.show(indent + 2)}`);
    }

    typeInf(env: Env): Type {
        try {
            const ts = this.args.map(x => [x, Tvar.fresh()] as [string, Type]);
            const env0 = env.addAll(ts);
            const t = this.value.typeInf(env0);
            return ts.reduceRight((t, ti) => new Tfun(ti[1], t), t[0]);
        }
        catch (error) {
            if (error instanceof Error) {
                error.message = `Type error in ${this.name}` + error.message;
            }
            throw error;
        }
    }

    interp(ctx: Context<any>): any {
        return this.interpx(0, ctx);
    }

    interpx(i: number, ctx: Context<any>): any {
        if (i < this.args.length) {
            return (x: any) => this.interpx(i + 1, ctx.add(this.args[i], x));
        }
        return this.value.interp(ctx)[0];
    }

    substitute(): Member {
        return this;
    }

    freeVars(): string[] {
        return [];
    }
}
