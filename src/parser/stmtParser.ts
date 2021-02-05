import { Stmt } from "../ast/stmt/stmt";
import { Sassign } from "../ast/stmt/assign";
import { Sexpr } from "../ast/stmt/expr";
import { StmtSequence } from "../ast/stmt/stmtSequence";
import { StmtExprItem } from "../ast/stmtExprItem/stmtExprItem";
import { SEIapp } from "../ast/stmtExprItem/app";
import { SEIchain } from "../ast/stmtExprItem/chain";
import { ParserUtils } from "./parserUtils";
import { ExprParser } from "./exprParser";
import { Parser } from "./parser-combinators";

export class StmtParser {

    constructor(
        readonly exprParser: ExprParser,
        readonly parserUtils: ParserUtils) { }

    readonly stmtExprItemAppParser: Parser<StmtExprItem>
        = this.exprParser.exprParser.map(x => new SEIapp(x));

    readonly stmtExprItemChainParser: Parser<StmtExprItem>
        = Parser.do(
            Parser.sat(/^\. */),
            this.parserUtils.parseIdent,
            this.exprParser.exprAccessParser.many()
        ).map(([_, x, es]) => new SEIchain(x, es));

    readonly stmtExprItemParser: Parser<StmtExprItem>
        = Parser.choices(
            this.stmtExprItemAppParser,
            this.stmtExprItemChainParser
        );

    readonly stmtExprParser: Parser<Stmt>
        = Parser.do(
            this.exprParser.exprParser,
            this.parserUtils.indentedSeq(this.stmtExprItemParser)
        ).map(([x, items]) => new Sexpr(x, items));

    readonly stmtAssignParser: Parser<Stmt>
        = Parser.do(
            this.parserUtils.parseIdent.many1(),
            Parser.sat(/^= */),
            Parser.pure(0).bind(_ => this.stmtSequenceParser)
        ).map(([[x, ...xs], _, s]) => new Sassign(x, xs, s));

    readonly stmtParser: Parser<Stmt>
        = Parser.choices(
            this.stmtAssignParser,
            this.stmtExprParser
        );

    readonly stmtSequenceParser: Parser<Stmt>
        = Parser.choices(
            this.stmtExprParser,
            this.parserUtils.indentedSeq1(this.stmtParser).map(x => new StmtSequence(x))
        );
}