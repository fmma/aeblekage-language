import { Polytype } from "../../typing/polytype";
import { Substitutable } from "../../typing/substitutable";
import { Substitution } from "../../typing/substitution";
import { Ast } from "../ast";
import { ClassType } from "./classType";
import { Import } from "./import";
import { Members } from "./members";
import { Type } from "./type";
import { Tapp } from "./type/app";
import { Tsymbol } from "./type/symbol";
import { Tvar } from "./type/var";

export interface StaticClassTypes {
    constructorType: Polytype | undefined,
    thisType: Type,
    superType: Type,
    imports?: Class[]
}

export class Class extends Ast implements Substitutable<Class> {
    staticTypes: StaticClassTypes;

    constructor(
        readonly imports: Import[],
        readonly name: string,
        readonly params: string[],
        readonly iface: ClassType | undefined,
        readonly members: Members,
        staticTypes?: StaticClassTypes
    ) {
        super();
        this.staticTypes = this.initClassTypes(staticTypes);
    }

    async getImports(): Promise<Class[]> {
        if (this.staticTypes.imports)
            return this.staticTypes.imports;
        const css = await Promise.all(this.imports.map(i => i.loadImport()));
        const result = [this, ...css.flat()];
        this.staticTypes.imports = result;
        return result;
    }

    async getSuperType(): Promise<Class | undefined> {
        const { iface } = this;
        if (iface == null)
            return undefined;
        const imports = await this.getImports();
        const superType = imports.find(x => x.name === iface.name);
        return superType?.instantiate(iface.params);
    }

    show(indent: number) {
        return [
            ...this.imports.map(i => i.show(indent)),
            this.indentedLine(indent, `class ${[this.name, ...this.params].join(' ')} ${this.iface ? this.iface.show() : ''}`),
            this.members.show(2)
        ].join('');
    }

    freeVars(set: Set<string>) {
        this.members.freeVars(set);
        this.iface?.freeVars(set);
        for (let param of this.params) {
            set.delete(param);
        }
    }

    getFreeVars(): string[] {
        const set = new Set<string>();
        this.freeVars(set);
        return [...set];
    }

    isClosed() {
        const set = new Set<string>();
        this.freeVars(set);
        return set.size === 0;
    }

    async typeCheck(): Promise<void> {
        const arbitraryClass = (await this.arbitrary()).initializeSymbols();
        const superType = (await arbitraryClass.getSuperType())?.initializeSymbols();
        const imports = await arbitraryClass.getImports();

        if (!arbitraryClass.isClosed())
            throw new Error(`Unbound type variables ${arbitraryClass.getFreeVars().join(', ')} in class ${arbitraryClass.name}.`);

        await arbitraryClass.members.typeCheck(this.staticTypes.superType, superType?.members, imports);
    }

    async arbitrary(): Promise<Class> {
        return this.instantiate(this.params.map(x => new Tsymbol(`$${x}`)));
    }

    initializeSymbols(): Class {
        const st = new Substitution({});
        for (let i of this.getFreeVars()) {
            st.subst[i] = new Tsymbol(i);
        }
        const result = this.substitute(st);
        return result;
    }

    substitute(subst: Substitution): Class {
        subst = subst.unset(this.params);
        return new Class(this.imports,
            this.name,
            this.params,
            this.iface?.substitute(subst),
            this.members.substitute(subst),
            {
                constructorType: this.staticTypes.constructorType,
                thisType: this.staticTypes.thisType.substitute(subst),
                superType: this.staticTypes.superType.substitute(subst)
            });
    }

    instantiate(ts: Type[]): Class {
        if (ts.length !== this.params.length)
            throw new Error(`Paramter count mismatch in instantiation of ${this.name} with (${ts.map(x => x.show()).join(', ')})`);

        const st = new Substitution({});
        for (let i = 0; i < ts.length; ++i) {
            st.subst[this.params[i]] = ts[i];
        }
        return new Class(this.imports,
            this.name,
            [],
            this.iface?.substitute(st),
            this.members.substitute(st),
            {
                constructorType: this.staticTypes.constructorType,
                thisType: this.staticTypes.thisType.substitute(st),
                superType: this.staticTypes.superType.substitute(st)
            });
    }

    async getType(memberName: string): Promise<Polytype> {
        const t = this.members.getType(memberName);
        if (t)
            return t;
        const iface = await this.getSuperType();
        const pt = iface?.getType(memberName);
        if (pt == null)
            throw new Error(`No type definition of ${memberName} in class ${this.name}`);
        return pt;
    }

    private initClassTypes(classTypes?: StaticClassTypes): StaticClassTypes {
        if (classTypes != null)
            return classTypes;
        const thisType = this.params.reduce((t, x) => new Tapp(t, new Tvar(x)), new Tsymbol(this.name) as Type);
        const superType =
            this.iface
                ? this.iface.params.reduce((t, a) => new Tapp(t, a), new Tsymbol(this.iface.name) as Type)
                : thisType;
        const constructorType = this.members.getConstructorType(this.params, superType);
        return {
            thisType, superType, constructorType
        };
    }
}
