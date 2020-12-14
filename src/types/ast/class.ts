import { Polytype } from "../../typing/polytype";
import { Substitution } from "../../typing/substitution";
import { Ast } from "../ast";
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
        readonly interfaceName: string,
        readonly interfaceParams: Type[],
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
                if (!this.defs[x.name]) {
                    if (mt.params.length > 0)
                        throw new Error(`Constructor argument type is too polymorphic:\n${mt.show(0)}`);

                    this.constructorArgTypes.push(mt.value);
                }
            });

        if (types == null) {
            const thisType = params.reduce((t, x) => new Tapp(t, new Tvar(x)), new Tsymbol(name) as Type);
            const superType = this.interfaceParams.reduce((t, a) => new Tapp(t, a), new Tsymbol(interfaceName) as Type);
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
    constructorArgTypes: Type[];
    specialTypes: ClassTypes;

    show(indent: number) {
        return [
            ...this.imports.map(i => i.show(indent)),
            this.indentedLine(indent, `class ${[this.name, ...this.params].join(' ')} : ${[this.interfaceName, ...this.interfaceParams.map(t => t.show())].join(' ')}`),
            ...this.members.map(m => m.show(2))
        ].join('');
    }


    freeVars(): string[] {
        return [...new Set([
            ...this.members.flatMap(m => m.freeVars()),
            ...this.interfaceParams.flatMap(a => a.freeVars())
        ])].filter(x => [this.name, this.interfaceName, ...this.params].indexOf(x) === -1);
    }


    instantiate(ts: Type[]): Class {
        if (ts.length !== this.params.length)
            throw new Error(`Paramter count mismatch in instantiation of ${this.name} with (${ts.map(x => x.show()).join(', ')})`);

        const st = new Substitution({});
        for (let i = 0; i < ts.length; ++i) {
            st.subst[this.params[i]] = ts[i];
        }
        st.subst[this.name] = new Tsymbol(this.name);
        st.subst[this.interfaceName] = new Tsymbol(this.interfaceName);
        return new Class(this.imports,
            this.name,
            [],
            this.interfaceName,
            this.interfaceParams.map(t => t.substitute(st)),
            this.members.map(x => x.substitute(st)),
            {
                constructorType: this.specialTypes.constructorType,
                thisType: this.specialTypes.thisType.substitute(st),
                superType: this.specialTypes.superType.substitute(st)
            });
    }
}
