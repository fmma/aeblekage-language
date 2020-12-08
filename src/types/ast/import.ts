import { Ast } from "../ast";

export class Import extends Ast {
    constructor(
        readonly path: string[],
        readonly name: string
    ) {
        super();
    }

    show() {
        return [...this.path, this.name].join('.')
    }
}
