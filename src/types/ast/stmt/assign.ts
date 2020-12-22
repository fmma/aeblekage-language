import { Context } from '../../../interp/context';
import { Env } from '../../../typing/env';
import { Stmt } from '../stmt';
import { Type } from '../type';
import { Tfun } from '../type/fun';
import { Tvar } from '../type/var';

export class Sassign extends Stmt {
    constructor(
        readonly x: string,
        readonly args: string[],
        readonly e: Stmt
    ) {
        super();
    }

    interp(ctx: Context<any>): [any, Context<any>] {
        const v = this.interpx(0, ctx);
        return [v, ctx.add(this.x, v)];
    }

    interpx(i: number, ctx: Context<any>): any {
        if (i < this.args.length) {
            return (x: any) => this.interpx(i + 1, ctx.add(this.args[i], x));
        }
        return this.e.interp(ctx);
    }

    typeInf(env: Env): [Type, Env] {
        const ts = this.args.map(x => [x, Tvar.fresh()] as [string, Type]);
        const env0 = env.addAll(ts);
        const x = this.e.typeInf(env0);
        const t = ts.reduceRight((t, ti) => new Tfun(ti[1], t), x[0])
        return [t, env0.add(this.x, t)];
    }

    show(indent: number): string {
        return this.indentedLine(indent, `${[this.x, ...this.args].join(' ')} = ${this.e.show()}`);
    }
}