import { Polytype } from "../../typing/polytype";
import { Substitution } from "../../typing/substitution";
import { loadImport } from "../../typing/typing";
import { Ast } from "../ast";
import { ClassType } from "./classType";
import { Import } from "./import";
import { Member } from "./member";
import { MemberType } from "./memberType";
import { Type } from "./type";
import { Tapp } from "./type/app";
import { Tfun } from "./type/fun";
import { Tsymbol } from "./type/symbol";
import { Tvar } from "./type/var";

export interface ClassTypes {
    constructorType: Polytype,
    thisType: Type,
    superType: Type
}

export class Class extends Ast {
    constructor(
        readonly imports: Import[],
        readonly name: string,
        readonly params: string[],
        readonly iface: ClassType | undefined,
        readonly members: (Member | MemberType)[],
        types?: ClassTypes
    ) {
        super();
        this.defs = {};
        this.types = {};
        this.constructorArgTypes = [];
        members
            .filter(x => x instanceof Member)
            .forEach(x => {
                const m = x as Member
                if (this.defs[x.name])
                    throw new Error(`Redefinition of ${m.name} in class ${name}.`);
                this.defs[x.name] = m;
            });
        members
            .filter(x => x instanceof MemberType)
            .forEach(x => {
                const mt = x as MemberType;
                if (this.types[x.name])
                    throw new Error(`Redefinition of type ${mt.name} in class ${name}.`);
                this.types[x.name] = mt;
                if (!this.defs[x.name])
                    this.constructorArgTypes.push(mt.value);
            });

        if (types == null) {
            const thisType = params.reduce((t, x) => new Tapp(t, new Tvar(x)), new Tsymbol(name) as Type);
            const superType =
                iface
                    ? iface.params.reduce((t, a) => new Tapp(t, a), new Tsymbol(iface.name) as Type)
                    : thisType;
            const constructorType = new Polytype(this.params,
                this.constructorArgTypes.reduceRight((t2, t1) => new Tfun(t1, t2), superType));
            this.specialTypes = {
                thisType, superType, constructorType
            }
        }
        else {
            this.specialTypes = types;
        }
    }

    defs: Record<string, Member>;
    types: Record<string, MemberType>;
    constructorArgTypes: Type[];
    specialTypes: ClassTypes;

    thisEnv(): Record<string, Polytype | undefined> {
        const env = {} as Record<string, Polytype | undefined>;
        this.members
            .filter(x => x instanceof MemberType)
            .forEach(x => {
                const mt = x as MemberType;
                env[x.name] = mt.polytype();
            });
        env[this.name] = this.specialTypes.constructorType;
        return env;
    }

    show(indent: number) {
        return [
            ...this.imports.map(i => i.show(indent)),
            this.indentedLine(indent, `class ${[this.name, ...this.params].join(' ')} ${this.iface ? this.iface.show() : ''}`),
            ...this.members.map(m => m.show(2))
        ].join('');
    }

    freeVars(): string[] {
        return [...new Set([
            ...this.members.flatMap(m => m.freeVars()),
            ...this.iface?.freeVars() ?? []
        ])].filter(x => [this.name, this.iface?.name ?? '', ...this.params].indexOf(x) === -1);
    }


    async instantiate(ts: Type[]): Promise<Class> {
        const imports = await Promise.all(this.imports.map(loadImport));
        if (ts.length !== this.params.length)
            throw new Error(`Paramter count mismatch in instantiation of ${this.name} with (${ts.map(x => x.show()).join(', ')})`);

        const st = new Substitution({});
        for (let i = 0; i < ts.length; ++i) {
            st.subst[this.params[i]] = ts[i];
        }
        st.subst[this.name] = new Tsymbol(this.name);
        if (this.iface)
            st.subst[this.iface.name] = new Tsymbol(this.iface.name);
        imports.forEach(i => {
            st.subst[i.name] = new Tsymbol(i.name);
        });
        return new Class(this.imports,
            this.name,
            [],
            this.iface?.substitute(st),
            this.members.map(x => x.substitute(st)),
            {
                constructorType: this.specialTypes.constructorType,
                thisType: this.specialTypes.thisType.substitute(st),
                superType: this.specialTypes.superType.substitute(st)
            });
    }
}
