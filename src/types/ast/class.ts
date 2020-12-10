import { Ast } from "../ast";
import { Import } from "./import";
import { Member } from "./member";
import { MemberType } from "./memberType";

export class Class extends Ast {
    constructor(
        readonly imports: Import[],
        readonly name: string,
        readonly params: string[],
        readonly interfaceName: string,
        readonly interfaceParams: string[],
        readonly memberTypes: MemberType[],
        readonly members: Member[]
    ) {
        super();
    }

    show(indent: number) {
        return [
            ...this.imports.map(i => i.show(indent)),
            this.indentedLine(indent, `class ${[this.name, ...this.params].join(' ')} : ${[this.interfaceName, ...this.interfaceParams].join(' ')}`),
            ...this.memberTypes.map(m => m.show(2)),
            ...this.members.map(m => m.show(2))
        ].join('');
    }
}
