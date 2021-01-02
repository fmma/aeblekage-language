import { BinopPrecedenceHierarchy, binopPrecedenceHierarchy } from "../binops";
import { Expr } from "../ast/expr";
import { Eapp } from "../ast/expr/app";
import { Ebinop } from "../ast/expr/binop";
import { Elambda } from "../ast/expr/lambda";
import { EmemberAccess } from "../ast/expr/memberAccess";
import { Enumber } from "../ast/expr/number";
import { Estring } from "../ast/expr/string";
import { Evar } from "../ast/expr/var";
import { parseIdent } from "./common";
import { Parser } from "./parser-combinators";

export const exprAtomParser: Parser<Expr>
    = Parser.choices(
        parseIdent
            .map(x => new Evar(x)),
        Parser.sat(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)? */)
            .map(x => new Enumber(parseFloat(x))),
        Parser.sat(/^"(\\.|[^"\\])*" */)
            .map(x => new Estring(x.trim())),
        Parser.sat(/^\( */)
            .bind(_ => exprLambdaParser)
            .post(Parser.sat(/^\) */))
    );

export const exprAccessParser: Parser<Expr>
    = exprAtomParser
        .bind(e0 => Parser.sat(/^\. */)
            .pre(parseIdent)
            .many()
            .map(xs => xs.reduce((e, x) => new EmemberAccess(e, x), e0)));

export const exprAppParser: Parser<Expr>
    = exprAccessParser
        .sepby1(Parser.pure(0))
        .map(es => es.reduce((e1, e2) => new Eapp(e1, e2)));

export const exprBinopParser = generateExprBinopParser(binopPrecedenceHierarchy);

export const exprLambdaParser: Parser<Expr>
    = Parser.choices(
        parseIdent.many1()
            .bind(x =>
                Parser.sat(/^=> */)
                    .pre(exprLambdaParser.map(e =>
                        x.reduceRight((e, x) => new Elambda(x, e), e)))),
        exprBinopParser
    );

export const exprParser: Parser<Expr>
    = exprLambdaParser

function generateExprBinopParser(binops?: BinopPrecedenceHierarchy): Parser<Expr> {
    if (binops == null)
        return exprAppParser;
    const psep = Parser.choices(...binops.binops.map(b => Parser.sat(b.regexp).map(_ => b)));
    return generateExprBinopParser(binops.sub)
        .sepby1_(psep)
        .map(([e0, es]) => es.reduce((e1, [b, e2]) => new Ebinop(e1, b, e2), e0));
}
