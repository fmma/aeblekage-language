import { Ast } from "../ast";
import { Expr } from "./expr";

export class Member extends Ast {
    constructor(
        readonly name: string,
        readonly value: Expr
    ) {
        super();
    }
}
