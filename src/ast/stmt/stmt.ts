import { Context } from "../../interp/context";
import { Env } from "../../typing/env";
import { Ast } from "../ast";
import { Type } from "../type/type";

export abstract class Stmt extends Ast {
    abstract typeInf(env: Env): [Type, Env];

    abstract interp(ctx: Context<any>): [any, Context<any>];
}