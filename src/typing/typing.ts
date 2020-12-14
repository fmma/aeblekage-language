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

    if (ifaceOrClass.freeVars().length > 0)
        throw new Error(`Unbound type variable(s): ${ifaceOrClass.freeVars().join(', ')}.`);

    if (ifaceOrClass instanceof Interface) {
        return;
    }
    if (ifaceOrClass instanceof Class) {
        let cl = ifaceOrClass;
        const imports = await Promise.all(cl.imports.map(loadImport));
        const ifacesObj = {} as Record<string, Interface | undefined>;
        imports.forEach(i => {
            if (i instanceof Interface) {
                ifacesObj[i.name] = i;
            }
        });

        const ifaces = imports.filter(i => i.name === cl.interfaceName);

        if (ifaces.length === 0)
            throw new Error(`Could not find interface ${cl.interfaceName} in imports.`);

        if (ifaces.length > 1)
            throw new Error(`Multiple interfaces of name ${cl.interfaceName} found in imports.`);

        let iface = ifaces[0];

        if (!(iface instanceof Interface))
            throw new Error(`${cl.interfaceName} was not an interface.`);

        cl = cl.instantiate(cl.params.map(x => new Tsymbol(`$${x}`)));
        iface = iface.instantiate(cl.interfaceParams);

        Object.keys(cl.types).forEach(k => {
            if (iface.types[k]) {
                throw new Error(`Redefinition of type ${k} from interface ${iface.name} in class ${cl.name} is not allowed.`);
            }
        });

        console.log(iface.show(0));
        console.log(cl.show(0));

        const env = new Env(
            {
                ...iface.thisEnv(),
                ...cl.thisEnv(),
                'this': new Polytype([], cl.specialTypes.superType),
                'this_': new Polytype([], cl.specialTypes.thisType)
            },
            ifacesObj,
            new Unification()
        );
        console.log('ENV:');
        console.log(env.show());

        console.log('CHECK:');
        Object.keys(cl.defs).forEach(k => {

            const type = cl.types[k] ?? iface?.types[k];

            if (type == null)
                throw new Error(`No type for ${cl.name}.${k}`);

            console.log('CHECKING ', cl.defs[k].show(0))
            console.log('FOR TYPE ', type.polytype().show());

            const targetType = type.polytype().instantiateArbitrary();

            const inferredType = cl.defs[k].typeInf(env);
            env.unification.unify(inferredType, targetType);
            env.unification.end();
            console.log(`OK ${inferredType.show()} === ${targetType.show()} in:`);
            console.log(env.unification.globalSubst.show());
        });
    }
    return 0;
}