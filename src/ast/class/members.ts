import { FileIO } from "../../fileio";
import { Context } from "../../interp/context";
import { Env } from "../../typing/env";
import { Polytype } from "../../typing/polytype";
import { Substitutable } from "../../typing/substitutable";
import { Substitution } from "../../typing/substitution";
import { Unification } from "../../typing/unification";
import { Ast } from "../ast";
import { Stmt } from "../stmt/stmt";
import { Tfun } from "../type/fun";
import { Type } from "../type/type";
import { Class } from "./class";
import { Member } from "./member";
import { MemberType } from "./memberType";

export interface Definition<T, S> {
    name: string;
    type: T;
    stmt: S;
}

export type Def = Definition<Polytype | undefined, Stmt | undefined>

export class Members extends Ast implements Substitutable<Members> {
    constructor(
        readonly defs: Def[],
    ) {
        super();
    }

    show(indent: number): string {
        return this.defs.map(d => this.showDef(indent, d)).join('');
    }

    private showDef(indent: number, def: Def): string {
        let result = '';
        if (def.type) {
            result += this.indentedLine(indent, def.name + ' : ' + def.type.show());
        }
        if (def.stmt) {
            result += this.indentedLine(indent, def.name + ' = ' + def.stmt.show(4));
        }
        return result;
    }

    substitute(subst: Substitution): Members {
        return new Members(
            this.defs.map(x => {
                if (x.type == null)
                    return x;
                return { ...x, type: x.type?.substitute(subst) };
            }));
    }

    freeVars(set: Set<string>): void {
        this.defs.map(x => x.type?.freeVars(set));
    }

    static fromUnorderedList(members: (MemberType | Member)[]): Members {
        const list: Record<string, [Member | undefined, MemberType | undefined]> = {};
        for (let member of members) {
            if (member instanceof Member) {
                if (list[member.name] == null) {
                    list[member.name] = [member, undefined];
                }
                else if (list[member.name][0] == null) {
                    list[member.name] = [member, list[member.name][1]];
                }
                else {
                    throw new Error(`Redefinition of ${member.name}.`);
                }
            }
            else {
                if (list[member.name] == null) {
                    list[member.name] = [undefined, member];
                }
                else if (list[member.name][1] == null) {
                    list[member.name] = [list[member.name][0], member];
                }
                else {
                    throw new Error(`Redefinition of type ${member.name}.`);
                }
            }
        }
        const defs: Def[] = [];
        for (let [v, t] of Object.values(list)) {

            defs.push({ name: v?.name ?? t?.name ?? '', stmt: v?.stmt(), type: t?.polytype() });
        }
        return new Members(defs);
    }

    getTypeDefs(): Definition<Polytype, undefined>[] {
        return this.defs.flatMap(x => {
            return x?.type && x?.stmt == null ? [{
                name: x.name,
                type: x.type,
                stmt: undefined
            }] : [];
        });
    }

    getConstructorType(params: string[], superType: Type): Polytype | undefined {
        const ts = this.getTypeDefs();
        if (ts.some(t => t.type.params.length > 0))
            return undefined;
        return new Polytype(params, ts.reduceRight((t2, t1) => new Tfun(t1.type.monotype, t2), superType))
    }

    getDef(name: string): Def | undefined {
        return this.defs.find(x => x.name === name);
    }

    getType(memberName: string): Polytype | undefined {
        return this.getDef(memberName)?.type;
    }

    async typeCheck(fileIO: FileIO, thisType: Type, superMembers: Members | undefined, imports: Class[]): Promise<void> {
        const env = this.createEnv(fileIO, thisType, superMembers, imports);
        for (let def of this.defs) {
            await this.typeCheckDef(superMembers, env, def);
        }
    }

    private createEnv(fileIO: FileIO, thisType: Type, superMembers: Members | undefined, imports: Class[]): Env {
        const env = new Env(fileIO, {}, {}, new Unification());
        for (let def of superMembers?.defs ?? []) {
            if (def.type)
                env.env[def.name] = def.type;
        }
        for (let def of this.defs) {
            if (def.type)
                env.env[def.name] = def.type;
        }
        for (let c of imports) {
            const constructorType = c.staticTypes.constructorType
            if (constructorType)
                env.env[c.name] = constructorType;
        }
        env.env['this'] = new Polytype([], thisType);

        for (let i of imports) {
            env.imports[i.name] = i;
        }
        return env;
    }

    private async typeCheckDef(superMembers: Members | undefined, env: Env, def: Def): Promise<void> {
        if (def.stmt) {
            const t = def.type ?? superMembers?.getType(def.name);
            if (t == null)
                throw new Error(`No type for ${def.name}.`);
            await this.typeCheckStmt(env, def.stmt, t);
        }
    }

    construct(ctx: Context<any>, superMembers: Members | undefined): Record<string, any> {
        const obj: Record<string, any> = superMembers?.construct(ctx, undefined) ?? {};
        for (let def of this.defs) {
            if (def.stmt) {
                obj[def.name] = def.stmt.interp(ctx)[0];
            }
        }
        return obj;
    }

    private async typeCheckStmt(env: Env, stmt: Stmt, type: Polytype): Promise<void> {
        env = env.beginUnification();
        const [t, _] = stmt.typeInf(env);
        env.unification.unify(t, type.instantiateArbitrary());
        await env.unification.end();
    }
}
