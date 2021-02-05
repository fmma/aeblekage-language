import { BinopPrecedenceHierarchy } from "../binops";
import { Expr } from "../ast/expr/expr";
import { Eapp } from "../ast/expr/app";
import { Ebinop } from "../ast/expr/binop";
import { Elambda } from "../ast/expr/lambda";
import { EmemberAccess } from "../ast/expr/memberAccess";
import { Enumber } from "../ast/expr/number";
import { Estring } from "../ast/expr/string";
import { Evar } from "../ast/expr/var";
import { ParserUtils } from "./parserUtils";
import { Parser } from "./parser-combinators";

export class ExprParser {

    constructor(
        readonly parserUtils: ParserUtils,
        readonly binopPrecedenceHierarchy: BinopPrecedenceHierarchy) {
    }

    readonly exprAtomParser: Parser<Expr>
        = Parser.choices(
            this.parserUtils.parseIdent
                .map(x => new Evar(x)),
            Parser.sat(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)? */)
                .map(x => new Enumber(parseFloat(x))),
            Parser.sat(/^"(\\.|[^"\\])*" */)
                .map(x => new Estring(x.trim())),
            Parser.sat(/^\( */)
                .bind(_ => this.exprLambdaParser)
                .post(Parser.sat(/^\) */))
        );

    readonly exprAccessParser: Parser<Expr>
        = this.exprAtomParser
            .bind(e0 => Parser.sat(/^\. */)
                .pre(this.parserUtils.parseIdent)
                .many()
                .map(xs => xs.reduce((e, x) => new EmemberAccess(e, x), e0)));

    readonly exprAppParser: Parser<Expr>
        = this.exprAccessParser
            .sepby1(Parser.pure(0))
            .map(es => es.reduce((e1, e2) => new Eapp(e1, e2)));

    readonly exprBinopParser = this.generateExprBinopParser(this.binopPrecedenceHierarchy);

    readonly exprLambdaParser: Parser<Expr>
        = Parser.choices(
            this.parserUtils.parseIdent.many1()
                .bind(x =>
                    Parser.sat(/^=> */)
                        .pre(this.exprLambdaParser.map(e =>
                            x.reduceRight((e, x) => new Elambda(x, e), e)))),
            this.exprBinopParser
        );

    readonly exprParser: Parser<Expr> = this.exprLambdaParser

    generateExprBinopParser(binops?: BinopPrecedenceHierarchy): Parser<Expr> {
        if (binops == null)
            return this.exprAppParser;
        const psep = Parser.choices(...binops.binops.map(b => Parser.sat(b.regexp).map(_ => b)));
        return this.generateExprBinopParser(binops.sub)
            .sepby1_(psep)
            .map(([e0, es]) => es.reduce((e1, [b, e2]) => new Ebinop(e1, b, e2), e0));
    }

}
