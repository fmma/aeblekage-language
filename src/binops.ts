import { polytypeParser } from "./parser/typeParser";
import { Tsymbol } from "./types/ast/type/symbol";
import { Polytype } from "./typing/polytype";
import { Substitution } from "./typing/substitution";

export class Binop {

    type: Polytype;

    constructor(
        readonly symbol: string,
        readonly leftSubPrecedence: number,
        readonly rightSubPrecedence: number,
        readonly precedence: number,
        type: string,
        readonly interp: (x: any, y: any) => any
    ) {
        this.regexp = new RegExp(`^${escapeRegExp(symbol)}\\ *`);
        const parsedType = polytypeParser.run(type);
        if (parsedType == null)
            throw new Error('Binop type parser failed');
        parsedType[0] = parsedType[0].substitute(new Substitution({ 'Bool': new Tsymbol('Bool') }));

        if (!parsedType[0].isClosed())
            throw new Error(`Binop ${symbol} : ${parsedType[0].show()} has free vars.`);
        this.type = parsedType[0];
    }

    regexp: RegExp;
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export class BinopPrecedenceHierarchy {
    constructor(
        readonly precedence: number,
        readonly binops: Binop[],
        readonly sub?: BinopPrecedenceHierarchy
    ) {
    }
}

export const binops = [
    new Binop('||', 102, 103, 103, 'forall. Bool -> Bool -> Bool', (x, y) => x || y),
    new Binop('&&', 104, 105, 105, 'forall. Bool -> Bool -> Bool', (x, y) => x && y),
    new Binop('==', 106, 107, 107, 'forall a. a -> a -> Bool', (x, y) => x == y),
    new Binop('>=', 106, 107, 107, 'forall a. a -> a -> Bool', (x, y) => x >= y),
    new Binop('<=', 106, 107, 107, 'forall a. a -> a -> Bool', (x, y) => x <= y),
    new Binop('>', 106, 107, 107, 'forall a. a -> a -> Bool', (x, y) => x > y),
    new Binop('<', 106, 107, 107, 'forall a. a -> a -> Bool', (x, y) => x < y),
    new Binop('+', 108, 109, 109, 'forall. number -> number -> number', (x, y) => x + y),
    new Binop('-', 108, 109, 109, 'forall. number -> number -> number', (x, y) => x - y),
    new Binop('*', 110, 111, 111, 'forall. number -> number -> number', (x, y) => x * y),
    new Binop('/', 110, 111, 111, 'forall. number -> number -> number', (x, y) => x / y)
]

export const binopPrecedenceHierarchy: BinopPrecedenceHierarchy = initializePrecedenceBinopHierarchy();

export function initializePrecedenceBinopHierarchy(): BinopPrecedenceHierarchy {
    const binopsPrecedenceGroups = new Map<number, Binop[]>();
    binops.forEach(b => {
        const list = binopsPrecedenceGroups.get(b.precedence);
        if (list == null) {
            binopsPrecedenceGroups.set(b.precedence, [b]);
        }
        else {
            list.push(b);
        }
    });

    const entries = [...binopsPrecedenceGroups.entries()].sort((a, b) => b[0] - a[0]);

    let h: BinopPrecedenceHierarchy | undefined = undefined;

    for (let i = 0; i < entries.length; ++i) {
        const binops = entries[i][1];
        h = new BinopPrecedenceHierarchy(entries[i][0], binops, h);
    }

    return h as BinopPrecedenceHierarchy;
}

initializePrecedenceBinopHierarchy();
