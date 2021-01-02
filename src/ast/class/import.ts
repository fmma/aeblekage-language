import { FileIO } from "../../fileio";
import { Ast } from "../ast";
import { Class } from "./class";

export class Import extends Ast {
    constructor(
        readonly path: string[]
    ) {
        super();
    }

    show(indent: number) {
        return this.indentedLine(indent, 'import ' + this.path.join('.'));
    }

    async loadImport(fileIO: FileIO): Promise<Class[]> {
        const result = await fileIO.requireImportPath(this.path);
        return result.map(x => x.initializeSymbols());
    }
}
