import { Ast } from "../ast";
import { Type } from "./type";

export class MemberType extends Ast {
    constructor(
        readonly name: string,
        readonly value: Type
    ) {
        super();
    }
}
