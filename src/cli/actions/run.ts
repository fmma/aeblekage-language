import { Action } from "./action";
import { GoArgs } from "./goArgs";

export class RunAction extends Action {
    async go(goArgs: GoArgs): Promise<number | void> {
        const classes = await this.mapGoClass(goArgs, cl => cl);
        const main = classes.find(cl => cl.members.getDef('main') != null);
        if (main == null)
            throw new Error('No main definition found.');
        // main.construct()['main']();
    }
}