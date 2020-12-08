import { Ast } from "../ast";
import { Import } from "./import";
import { Member } from "./member";
import { MemberType } from "./memberType";

export class Interface extends Ast {
    constructor(
        readonly imports: Import[],
        readonly name: string,
        readonly params: string[],
        readonly members: MemberType[]
    ) {
        super();
    }

    show() {
        return [
            ...this.imports.map(i => i.show() + '\n'),
            `interface ${[this.name, ...this.params].join(' ')}`,
            ...this.members.map(m => m.show(2))
        ].join('');
    }
}
