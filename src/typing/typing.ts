import { requireImport } from "../fileio";
import { Class } from "../types/ast/class";
import { Import } from "../types/ast/import";
import { Interface } from "../types/ast/interface";
import { Tsymbol } from "../types/ast/type/symbol";
import { beginUnification, unify } from "./unification";

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

        console.log(iface.show(0));
        console.log(cl.show(0));

        const env = iface.thisEnv().concat(cl.thisEnv(imports))
            .add('this', cl.specialTypes.thisType)
            .add('super', cl.specialTypes.superType);
        console.log('ENV:');
        console.log(env.show());

        console.log('CHECK:');
        Object.keys(cl.defs).forEach(k => {

            const type = cl.types[k] ?? iface?.types[k];

            if (type == null)
                throw new Error(`No type for ${cl.name}.${k}`);

            console.log('CHECKING ', cl.defs[k].show(0))
            console.log('FOR TYPE ', type.polytype().show());

            const targetType = type.polytype().symbolicate();

            const [[t1, t2], g] = beginUnification(() => {
                const inferredType = cl.defs[k].typeInf(env);
                unify(inferredType, targetType);
                return [inferredType, targetType];
            });

            console.log(`OK ${t1.show()} === ${t2.show()} in:`);
            console.log(g.show());
        });
    }
    return 0;
}