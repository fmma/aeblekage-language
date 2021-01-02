import { Context } from "../../interp/context";
import { Env } from "../../typing/env";
import { Ast } from "../ast";
import { Type } from "../type/type";

// e ::= x | e e | e <binop> e | e.x | x => e | e; e | x = e | <number> | <string>

// example
// x = Just 4
// y => f = x.fromMaybe
//   f (1+1) + 20
//

// precedence
// access: 1003.1004   parens when >= 1004           (f a).x
// app:    1001 1002   parens when >= 1002 f a b     f (g a)
// binop:  1**  1**
// lambda: 5 => 4    parens when >= 5   x=>y=>e   (x=>e1)=>e2
// assign: 3 = 2     parens when >= 3   x = y = 0 (x = y) = 0 x = (y => 0)

export abstract class Expr extends Ast {
    // G, e |- t
    abstract typeInf(env: Env): Type;
    abstract interp(ctx: Context<any>): any;
}
