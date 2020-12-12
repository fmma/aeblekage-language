import { Env } from "../../../typing/env";
import { Expr } from "../expr";
import { Type } from "../type";

export class Evar extends Expr {
    constructor(
        readonly name: string
    ) {
        super();
    }

    show() {
        return this.name;
    }

    typeInf(env: Env): Type {
        return env.get(this.name);
    }
}
