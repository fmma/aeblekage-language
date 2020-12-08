import { Type } from "../type";

export class Tvar extends Type {
    constructor(
        readonly name: string
    ) {
        super();
    }

    show() {
        return this.name;
    }
}
