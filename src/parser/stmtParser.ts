import { Stmt } from "../types/ast/stmt";
import { Sassign } from "../types/ast/stmt/assign";
import { Sexpr } from "../types/ast/stmt/expr";
import { StmtSequence } from "../types/ast/stmt/stmtSequence";
import { StmtExprItem } from "../types/ast/stmtExprItem";
import { SEIapp } from "../types/ast/stmtExprItem/app";
import { SEIchain } from "../types/ast/stmtExprItem/chain";
import { indentedSeq, indentedSeq1, parseIdent } from "./common";
import { exprAccessParser, exprParser } from "./exprParser";
import { Parser } from "./parser-combinators";

export const stmtExprItemAppParser: Parser<StmtExprItem>
    = exprParser.map(x => new SEIapp(x));

export const stmtExprItemChainParser: Parser<StmtExprItem>
    = Parser.do(
        Parser.sat(/^\. */),
        parseIdent,
        exprAccessParser.many()
    ).map(([_, x, es]) => new SEIchain(x, es));

export const stmtExprItemParser: Parser<StmtExprItem>
    = Parser.choices(
        stmtExprItemAppParser,
        stmtExprItemChainParser
    );

export const stmtExprParser: Parser<Stmt>
    = Parser.do(
        exprParser,
        indentedSeq(stmtExprItemParser)
    ).map(([x, items]) => new Sexpr(x, items));

export const stmtAssignParser: Parser<Stmt>
    = Parser.do(
        parseIdent.many1(),
        Parser.sat(/^= */),
        Parser.pure(0).bind(_ => stmtSequenceParser)
    ).map(([[x, ...xs], _, s]) => new Sassign(x, xs, s));

export const stmtParser: Parser<Stmt>
    = Parser.choices(
        stmtAssignParser,
        stmtExprParser
    );

export const stmtSequenceParser: Parser<Stmt>
    = Parser.choices(
        stmtExprParser,
        indentedSeq1(stmtParser).map(x => new StmtSequence(x))
    );
