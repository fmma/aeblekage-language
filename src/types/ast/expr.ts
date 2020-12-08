import { Ast } from "../ast";

// e ::= x | e e | e <binop> e | e.x | x => e | e; e | x = e | <number> | <string>

// example
// x = Just 4
// y => f = x.fromMaybe
//   f (1+1) + 20
//

// precedence
// access: 103 104   parens when >= 104           (f a).x
// app:    101 102   parens when >= 102 f a b     f (g a)
//         7 * 8     parens when >= 8   1+2*3     (1+2)*3
//         5 - 6     parens when >= 6   1-2-3     1-(2-3)
//         5 + 6     parens when >= 6   1+2+3     1+2+3
//         4 == 4
//         3 && 3
//         2 || 2
// lambda: 1 => 0    parens when >= 1   x=>y=>e   (x=>e1)=>e2

export class Expr extends Ast {

}
