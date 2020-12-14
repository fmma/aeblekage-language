import { Class } from "../types/ast/class";
import { ExprSequence } from "../types/ast/exprSequence";
import { Import } from "../types/ast/import";
import { Interface } from "../types/ast/interface";
import { Member } from "../types/ast/member";
import { MemberType } from "../types/ast/memberType";
import { Type } from "../types/ast/type";
import { Tfun } from "../types/ast/type/fun";
import { parseIdent, parseNewline } from "./common";
import { exprParser } from "./exprParser";
import { Parser } from "./parser-combinators";
import { typeParser } from "./typeParser";

export const astImportParser: Parser<Import>
    = Parser.sat(/^import  */).pre(parseIdent.sepby1(Parser.sat(/^\./)).map(x => new Import(x)));

export const astMemberTypeParser: Parser<MemberType>
    = parseIdent.bind(f =>
        parseIdent.many().bind(as =>
            Parser.sat(/^: */).pre(typeParser.choice(astTypeSequenceParser).map(t =>
                new MemberType(f, as, t)))));

export const astMemberParser: Parser<Member>
    = parseIdent.bind(f =>
        parseIdent.many().bind(as =>
            Parser.sat(/^= */).pre((
                exprParser.map(x => new ExprSequence([x]))
                    .choice(astExprSequenceParser))
                .map(es => new Member(f, as, es)))));

export const astExprSequenceParser: Parser<ExprSequence>
    = iseq(exprParser).map(es => new ExprSequence(es));

export const astTypeSequenceParser: Parser<Type>
    = iseq(typeParser).map(ts => ts.reduceRight((t2, t1) => new Tfun(t1, t2)));

export const astInterfaceParser: Parser<Interface>
    = Parser.do(
        astImportParser.post(parseNewline).many(),
        Parser.sat(/^interface  */),
        parseIdent,
        parseIdent.many(),
        iseq(astMemberTypeParser)
    ).map(([is, _2, f, as, ms]) => new Interface(is, f, as, ms));

export const astClassParser: Parser<Class>
    = Parser.do(
        astImportParser.post(parseNewline).many(),
        Parser.sat(/^class  */),
        parseIdent,
        parseIdent.many(),
        Parser.sat(/^: */),
        parseIdent,
        typeParser.many(),
        iseq(astMemberTypeParser.disjointChoice(astMemberParser)),
    ).map(([is, _2, f, as, _3, g, bs, ms]) => new Class(is, f, as, g, bs, ms));

export const astParser = Parser.sat(/\s*/).pre(astInterfaceParser.disjointChoice(astClassParser));

function iseq<A>(p: Parser<A>): Parser<A[]> {
    return Parser.sat(/^\ni */)
        .pre(p.sepby(parseNewline))
        .post(Parser.sat(/^\nd */)).choice(Parser.pure([]));
}

function iseq1<A>(p: Parser<A>): Parser<A[]> {
    return Parser.sat(/^\ni */)
        .pre(p.sepby1(parseNewline))
        .post(Parser.sat(/^\nd */)).choice(Parser.pure([]));
}