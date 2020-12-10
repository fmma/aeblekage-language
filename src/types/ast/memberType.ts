import { Ast } from "../ast";
import { Type } from "./type";

export class MemberType extends Ast {
    constructor(
        readonly name: string,
        readonly params: string[],
        readonly value: Type
    ) {
        super();
    }

    show(indent: number) {
        return this.indentedLine(indent, `${[this.name, ...this.params].join(' ')} : ${this.value.show()}`);
    }
}
