export interface BinopConfig {
    ops: string,
    l?: BinopConfig,
    r?: BinopConfig,
    lr?: BinopConfig
}

export function parseBinopConfig(config: BinopConfig): BinopPrecedenceHierarchy {
    const go: (cfg: BinopConfig, prec: number) => BinopPrecedenceHierarchy = (cfg, prec) => {
        if ([cfg.l, cfg.r, cfg.lr].filter(x => x).length > 1)
            throw new Error();
        const leftPrec = cfg.l == null && cfg.lr == null ? prec : prec - 1;
        const rightPrec = cfg.r == null && cfg.lr == null ? prec : prec - 1;
        const subCfg = cfg.l ?? cfg.r ?? cfg.lr;
        return new BinopPrecedenceHierarchy(
            prec,
            cfg.ops.split(' ').map(x => new Binop(x, leftPrec, rightPrec, prec)),
            subCfg == null ? undefined : go(subCfg, prec + 2)
        );
    };
    return go(config, 103);
}

export class Binop {

    constructor(
        readonly symbol: string,
        readonly leftSubPrecedence: number,
        readonly rightSubPrecedence: number,
        readonly precedence: number
    ) {
        this.regexp = new RegExp(`^${escapeRegExp(symbol)}\\ *`);
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

    allBinops(): Binop[] {
        return [...this.binops, ...this.sub?.allBinops() ?? []];
    }
}

