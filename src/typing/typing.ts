import { requireImportPath } from "../fileio";
import { Class } from "../types/ast/class";
import { Import } from "../types/ast/import";
import { Tsymbol } from "../types/ast/type/symbol";
import { Env } from "./env";
import { Polytype } from "./polytype";
import { Unification } from "./unification";

let _debugTyping = false;
export function _debugTurnTyping() {
    _debugTyping = true;
}

export async function requireAndTypeCheck(path: string) {
    const types = await requireImportPath(path.split('.') ?? []);
    await Promise.all(types.map(typecheckType));
    return 0;
}

async function typecheckType(cl: Class): Promise<void> {
    await cl.typeCheck();
}
