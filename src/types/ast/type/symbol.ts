import { Type } from "../type";

export class Tsymbol extends Type {
    constructor(
        readonly name: string
    ) {
        super();
    }

    show() {
        return '`' + this.name;
    }

    substitute(): Type {
        return this;
    }

    freeVars(): string[] {
        return [];
    }

    unificationType = {
        type: 'cstr' as const,
        name: this.name,
        args: []
    };
}