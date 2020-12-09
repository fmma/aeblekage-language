import { Parser } from "../../parser/parser-combinators";
import { Ast } from "../ast";
import { Tapp } from "./type/app";
import { Tfun } from "./type/fun";
import { Tvar } from "./type/var";

// t ::= a | t t | t -> t

// precedence
// app: 1 2     parens when >= 2  f a b    f (g a)
// fun: 1 -> 0  parens when >= 1  a->b->c  (a->b)->c
export class Type extends Ast {

}
