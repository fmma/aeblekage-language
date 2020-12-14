import { Polytype } from "../../typing/polytype";
import { Substitution } from "../../typing/substitution";
import { Ast } from "../ast";
import { Import } from "./import";
import { MemberType } from "./memberType";
import { Type } from "./type";
import { Tsymbol } from "./type/symbol";

export class Interface extends Ast {
    constructor(
        readonly imports: Import[],
        readonly name: string,
        readonly params: string[],
        readonly members: MemberType[]
    ) {
        super();
        this.types = {};
        this.members.forEach(x => {
            const mt = x as MemberType;
            if (this.types[x.name])
                throw new Error(`Redefinition of ${x.name} in interface ${name}.`);
            this.types[x.name] = mt;
        });
    }

    types: Record<string, MemberType>;

    thisEnv(): Record<string, Polytype | undefined> {
        const env = {} as Record<string, Polytype | undefined>;
        this.members.forEach(x => {
            const mt = x as MemberType;
            env[x.name] = mt.polytype();
        });
        return env;
    }

    show(indent: number) {
        return [
            ...this.imports.map(i => i.show(indent)),
            this.indentedLine(indent, `interface ${[this.name, ...this.params].join(' ')}`),
            ...this.members.map(m => m.show(indent + 2))
        ].join('');
    }

    freeVars(): string[] {
        return [...new Set(this.members.flatMap(m => m.freeVars()))]
            .filter(x => [this.name, ...this.params].indexOf(x) === -1);
    }

    instantiate(ts: Type[]): Interface {
        if (ts.length !== this.params.length)
            throw new Error(`Paramter count mismatch in instantiation of ${this.name}(${this.params.join(', ')}) with (${ts.map(x => x.show()).join(', ')})`);

        const st = new Substitution({});
        for (let i = 0; i < ts.length; ++i) {
            st.subst[this.params[i]] = ts[i];
        }
        st.subst[this.name] = new Tsymbol(this.name);
        return new Interface(this.imports, this.name, [], this.members.map(x => x.substitute(st)));
    }
}
