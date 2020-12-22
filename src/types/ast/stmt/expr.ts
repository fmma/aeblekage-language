import { Context } from '../../../interp/context';
import { Env } from '../../../typing/env';
import { Expr } from '../expr';
import { Stmt } from '../stmt';
import { StmtExprItem } from '../stmtExprItem';
import { Type } from '../type';

export class Sexpr extends Stmt {

    constructor(
        readonly e: Expr,
        readonly items: StmtExprItem[]
    ) {
        super();
    }

    typeInf(env: Env): [Type, Env] {
        return [this.items.reduce<Type>((t, i) => i.typeInf(t, env), this.e.typeInf(env)), env];
    }

    interp(ctx: Context<any>): [any, Context<any>] {
        return [this.items.reduce((v, i) => i.interp(v, ctx), this.e.interp(ctx)), ctx];
    }

    show(indent: number): string {
        return this.indentedLine(indent, this.e.show()) + this.items.map(i => i.show(indent + 2)).join('');
    }
}