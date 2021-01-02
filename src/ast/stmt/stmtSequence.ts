import { Context } from "../../interp/context";
import { Env } from "../../typing/env";
import { Stmt } from "../stmt";
import { Type } from "../type";

export class StmtSequence extends Stmt {
    constructor(
        readonly ss: Stmt[]
    ) {
        super();
    }

    show(indent: number) {
        return this.ss.map(e => e.show(indent)).join('\n');
    }

    typeInf(env: Env): [Type, Env] {
        if (this.ss.length === 0)
            throw new Error('Cannot type empty expression sequence.');

        let r = this.ss[0].typeInf(env);
        for (let i = 1; i < this.ss.length; ++i) {

            r = this.ss[i].typeInf(r[1]);
        }
        return r;
    }

    interp(ctx: Context<any>): [any, Context<any>] {
        if (this.ss.length === 0)
            throw new Error('Cannot interpret empty expression sequence.');

        let r = this.ss[0].interp(ctx);
        for (let i = 1; i < this.ss.length; ++i) {
            r = this.ss[i].interp(r[1]);
        }
        return r;
    }
}
