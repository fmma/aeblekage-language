import { requireImport } from "../fileio";
import { Class } from "../types/ast/class";
import { Import } from "../types/ast/import";
import { Interface } from "../types/ast/interface";
import { Tsymbol } from "../types/ast/type/symbol";
import { Env } from "./env";
import { Polytype } from "./polytype";
import { Unification } from "./unification";

export async function loadImport(i: Import): Promise<Interface | Class> {
    return await requireImport(i.path);
}

export async function requireAndTypeCheck(path: string) {
    const ifaceOrClass = await requireImport(path.split('.') ?? []);

    if (ifaceOrClass instanceof Interface) {
        return;
    }
    if (ifaceOrClass instanceof Class) {
        await typecheckClass(ifaceOrClass);
    }
    return 0;
}

function getIfaces(imports: (Class | Interface)[]): Record<string, Interface | undefined> {
    const ifaces = {} as Record<string, Interface | undefined>;
    imports.forEach(i => {
        if (i instanceof Interface) {
            if (ifaces[i.name])
                throw new Error(`Multiple interfaces of name ${i.name}`);
            ifaces[i.name] = i;
        }
    });
    return ifaces;
}

function getConstructors(imports: (Class | Interface)[]): Record<string, Polytype | undefined> {
    const cstrs = {} as Record<string, Polytype | undefined>;
    imports.forEach(i => {
        if (i instanceof Class) {
            if (cstrs[i.name])
                throw new Error(`Multiple constructors of name ${i.name}`);
            cstrs[i.name] = i.specialTypes.constructorType;
        }
    });
    return cstrs;
}

async function typecheckClass(cl: Class) {
    const imports = await Promise.all(cl.imports.map(loadImport));
    const ifaces = getIfaces(imports);
    const cstrs = getConstructors(imports);
    cl = cl.instantiate(cl.params.map(x => new Tsymbol(`$${x}`)), Object.values(ifaces) as Interface[]);

    if (cl.freeVars().length > 0)
        throw new Error(`Unbound type variable(s): ${cl.freeVars().join(', ')}.`);

    const iface = await ifaces[cl.interfaceName]?.instantiate(cl.interfaceParams);
    if (iface == null)
        throw new Error(`Interface ${cl.interfaceName} not found.`);
    Object.keys(cl.types).forEach(k => {
        if (iface.types[k]) {
            throw new Error(`Redefinition of type ${k} from interface ${iface.name} in class ${cl.name} is not allowed.`);
        }
    });

    console.log(iface.show(0));
    console.log(cl.show(0));

    console.log('CHECK:');

    for (let k of Object.keys(iface.types)) {
        if (cl.defs[k] == null)
            throw new Error(`Interface method ${iface.name}.${k} not implemented in ${cl.name}.`);
    };
    for (let k of Object.keys(cl.defs)) {
        await checkMemberDef(k, cl, iface, ifaces, cstrs);
    };
    console.log(cl.name, ':', cl.specialTypes.constructorType.show());
}

async function checkMemberDef(name: string,
    cl: Class,
    iface: Interface,
    ifaces: Record<string, Interface | undefined>,
    cstrs: Record<string, Polytype | undefined>) {
    const env = new Env(
        {
            ...cstrs,
            ...iface.thisEnv(),
            ...cl.thisEnv(),
            'this': new Polytype([], cl.specialTypes.superType),
            'this_': new Polytype([], cl.specialTypes.thisType)
        },
        ifaces,
        new Unification()
    );
    console.log('ENV:');
    console.log(env.show());

    const type = cl.types[name] ?? iface?.types[name];

    if (type == null)
        throw new Error(`No type for ${cl.name}.${name}`);

    console.log('CHECKING ', cl.defs[name].show(0))
    console.log('FOR TYPE ', type.polytype().show());

    const targetType = type.polytype().instantiateArbitrary();

    const inferredType = cl.defs[name].typeInf(env);
    env.unification.unify(inferredType, targetType);
    await env.unification.end();
    console.log(`OK ${inferredType.show()} === ${targetType.show()} in:`);
    console.log(env.unification.globalSubst.show());
}
