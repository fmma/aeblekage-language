import { requireImportPath } from "../fileio";
import { Class } from "../types/ast/class";
import { Import } from "../types/ast/import";
import { Tsymbol } from "../types/ast/type/symbol";
import { Env } from "./env";
import { Polytype } from "./polytype";
import { Unification } from "./unification";

const _debugTyping = true;

export async function loadImport(i: Import): Promise<Class[]> {
    return await requireImportPath(i.path);
}

export async function requireAndTypeCheck(path: string) {
    const types = await requireImportPath(path.split('.') ?? []);
    await Promise.all(types.map(typecheckType));
    return 0;
}

function getIfaces(imports: (Class)[]): Record<string, Class | undefined> {
    const ifaces = {} as Record<string, Class | undefined>;
    imports.forEach(i => {
        if (ifaces[i.name])
            throw new Error(`Multiple interfaces of name ${i.name}`);
        ifaces[i.name] = i;
    });
    return ifaces;
}

function getConstructors(imports: Class[]): Record<string, Polytype | undefined> {
    const cstrs = {} as Record<string, Polytype | undefined>;
    imports.forEach(i => {
        if (i instanceof Class) {
            if (cstrs[i.name])
                throw new Error(`Multiple constructors of name ${i.name}`);
            if (i.specialTypes.constructorType.freeVars().length === 0)
                cstrs[i.name] = i.specialTypes.constructorType;
        }
    });
    return cstrs;
}

async function typecheckType(cl: Class) {
    const imports = (await Promise.all(cl.imports.map(loadImport))).flat();
    const ifaces = getIfaces(imports);
    const cstrs = getConstructors(imports);

    ifaces[cl.iface?.name ?? cl.name] = cl.iface?.name ? ifaces[cl.iface?.name] : cl;
    cl = await cl.instantiate(cl.params.map(x => new Tsymbol(`$${x}`)));

    if (cl.freeVars().length > 0)
        throw new Error(`Unbound type variable(s): ${cl.freeVars().join(', ')}.`);

    const iface = cl.iface
        ? await ifaces[cl.iface.name]?.instantiate(cl.iface.params)
        : undefined;
    Object.keys(cl.types).forEach(k => {
        if (iface?.types[k]) {
            throw new Error(`Redefinition of type ${k} from interface ${iface.name} in class ${cl.name} is not allowed.`);
        }
    });

    if (_debugTyping) {
        console.log(iface?.show(0));
        console.log(cl.show(0));

        console.log('CHECK:');
    }

    for (let k of Object.keys(iface?.types ?? {})) {
        if (iface?.defs[k] == null && cl.defs[k] == null)
            throw new Error(`Interface method ${iface?.name}.${k} not implemented in ${cl.name}.`);
    };
    for (let k of Object.keys(cl.defs)) {
        await checkMemberDef(k, cl, iface, ifaces, cstrs);
    };
    if (_debugTyping)
        console.log(cl.name, ':', cl.specialTypes.constructorType.show());
}

async function checkMemberDef(name: string,
    cl: Class,
    iface: Class | undefined,
    ifaces: Record<string, Class | undefined>,
    cstrs: Record<string, Polytype | undefined>) {
    const env = new Env(
        {
            ...cstrs,
            ...iface?.thisEnv(),
            ...cl.thisEnv(),
            'this': new Polytype([], cl.specialTypes.superType),
            'this_': new Polytype([], cl.specialTypes.thisType)
        },
        ifaces,
        new Unification()
    );
    if (_debugTyping) {
        console.log('ENV:');
        console.log(env.show());
    }
    const type = cl.types[name] ?? iface?.types[name];

    if (type == null)
        throw new Error(`No type for ${cl.name}.${name}`);

    if (_debugTyping) {
        console.log('CHECKING ', cl.defs[name].show(0))
        console.log('FOR TYPE ', type.polytype().show());
    }
    const targetType = type.polytype().instantiateArbitrary();

    const inferredType = cl.defs[name].typeInf(env);
    env.unification.unify(inferredType, targetType);
    await env.unification.end();
    if (_debugTyping) {
        console.log(`OK ${inferredType.show()} === ${targetType.show()} in:`);
        console.log(env.unification.globalSubst.show());
    }
}
