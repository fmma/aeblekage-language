import { BinopPrecedenceHierarchy, binopPrecedenceHierarchy, binops } from "../binops";
import { Expr } from "../types/ast/expr";
import { Eapp } from "../types/ast/expr/app";
import { Ebinop } from "../types/ast/expr/binop";
import { Ebool } from "../types/ast/expr/bool";
import { Elambda } from "../types/ast/expr/lambda";
import { Elet } from "../types/ast/expr/let";
import { EmemberAccess } from "../types/ast/expr/memberAccess";
import { Enumber } from "../types/ast/expr/number";
import { Eseq } from "../types/ast/expr/seq";
import { Estring } from "../types/ast/expr/string";
import { Evar } from "../types/ast/expr/var";
import { indentedSeq1, parseDedent, parseIdent, parseIndent, parseNewline } from "./common";
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
        parseIdent.bind(x => Parser.sat(/^=> */).pre(exprLambdaParser.map(e => new Elambda(x, e)))),
        exprBinopParser
    );

export const exprPostfixedParser: Parser<Expr>
    = exprLambdaParser.bind(e =>
        indentedSeq1(exprPostfixParser)
            .optional()
            .map(fs => (fs ?? []).reduce((e1, f) => f(e1), e)));

function memberAccesses(e: Expr, xs: string[]) {
    return xs.reduce((e, x) => new EmemberAccess(e, x), e);
}

export const exprBinopPostfixParser: Parser<(e: Expr) => Expr>
    = Parser.do(
        Parser.choices(...binops.map(b => Parser.sat(b.regexp).map(_ => b))),
        exprPostfixedParser
    ).map(([b, e2]) => (e1: Expr) => new Ebinop(e1, b, e2));

export const exprPostfixParser: Parser<(e: Expr) => Expr>
    = Parser.choices<(e: Expr) => Expr>(
        Parser.sat(/^\. */)
            .pre(parseIdent).many1()
            .bind(xs => exprPostfixedParser
                .map(e2 => (e1: Expr) => new Eapp(memberAccesses(e1, xs), e2))),
        Parser.sat(/^\. */)
            .pre(parseIdent).many1()
            .map(xs => (e1: Expr) => memberAccesses(e1, xs)),
        exprPostfixedParser
            .map(e2 => (e1: Expr) => new Eapp(e1, e2)),
        exprBinopPostfixParser);

export const exprLetParser: Parser<Expr>
    = parseIdent.many1().post(Parser.sat(/^= */)).optional().bind(xs =>
        exprPostfixedParser.bind(e1 =>
            parseNewline.pre(exprLetParser).optional().map(e2 => {
                if (e2 == null) {
                    if (xs != null)
                        throw new Error(`Parse error at ${xs} = ${e1.show()}`);
                    return e1;
                }
                if (xs == null)
                    return new Eseq(e1, e2);
                const x = xs[0];
                const xs0 = xs.slice(1);
                return new Elet(x, xs0.reduceRight((e, x) => new Elambda(x, e), e1), e2);
            }
            )
        ));

export const exprParser: Parser<Expr>
    = parseIndent
        .pre(exprLetParser)
        .post(parseDedent)
        .choice(exprPostfixedParser);

function generateExprBinopParser(binops?: BinopPrecedenceHierarchy): Parser<Expr> {
    if (binops == null)
        return exprAppParser;
    const psep = Parser.choices(...binops.binops.map(b => Parser.sat(b.regexp).map(_ => b)));
    return generateExprBinopParser(binops.sub)
        .sepby1_(psep)
        .map(([e0, es]) => es.reduce((e1, [b, e2]) => new Ebinop(e1, b, e2), e0));
}
