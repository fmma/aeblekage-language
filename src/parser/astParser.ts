import { ExprSequence } from "../types/ast/exprSequence";
import { Import } from "../types/ast/import";
import { Interface } from "../types/ast/interface";
import { Member } from "../types/ast/member";
import { MemberType } from "../types/ast/memberType";
import { parseIdent, parseNewline } from "./common";
import { exprParser } from "./exprParser";
import { Parser } from "./parser-combinators";
import { typeParser } from "./typeParser";

export const astImportParser: Parser<Import>
    = Parser.sat(/^import  */).pre(parseIdent.sepby1(Parser.sat(/^\./)).map(x => new Import(x)));

export const astMemberTypeParser: Parser<MemberType>
    = parseIdent.bind(f =>
        parseIdent.many().bind(as =>
            Parser.sat(/^: */).pre(typeParser.map(t =>
                new MemberType(f, as, t)))));

export const astMemberParser: Parser<Member>
    = parseIdent.bind(f =>
        parseIdent.many().bind(as =>
            Parser.sat(/^: */).pre(astExprSequenceParser.map(es =>
                new Member(f, as, es)))));

export const astExprSequenceParser: Parser<ExprSequence>
    = iseq(exprParser).map(es => new ExprSequence(es));

export function iseq<A>(p: Parser<A>): Parser<A[]> {
    return Parser.sat(/^\ni */)
        .pre(p.sepby(parseNewline))
        .post(Parser.sat(/^\nd */));
}

export const astInterfaceParser: Parser<Interface>
    = Parser.sat(/\s*/)
        .pre(astImportParser.post(parseNewline)
            .many()
            .bind(is => Parser.sat(/^interface  */).pre(
                parseIdent.bind(f =>
                    parseIdent.many().bind(as =>
                        iseq(astMemberTypeParser).map(ms =>
                            new Interface(is, f, as, ms))))
            )));
