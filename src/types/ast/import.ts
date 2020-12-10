import { Ast } from "../ast";

export class Import extends Ast {
    constructor(
        readonly path: string[]
    ) {
        super();
    }

    show(indent: number) {
        return this.indentedLine(indent, 'import ' + this.path.join('.'));
    }
}
