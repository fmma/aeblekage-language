import { Context } from "../interp/context";
import { Env } from "../typing/env";
import { Ast } from "./ast";
import { Type } from "./type";

export abstract class StmtExprItem extends Ast {

    abstract typeInf(t: Type, env: Env): Type;

    abstract interp(v: any, ctx: Context<any>): any;
}