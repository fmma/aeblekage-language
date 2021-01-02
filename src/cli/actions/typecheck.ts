import { Action } from "./action";
import { GoArgs } from "./goArgs";

export class TypecheckAction extends Action {
    async go(goArgs: GoArgs): Promise<number> {
        await this.mapGoClass(goArgs, cl => cl.typeCheck(goArgs.fileIO))
        return 0;
    }
}
