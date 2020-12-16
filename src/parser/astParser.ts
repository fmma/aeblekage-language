import { Class } from "../types/ast/class";
import { ClassType } from "../types/ast/classType";
import { ExprSequence } from "../types/ast/exprSequence";
import { Import } from "../types/ast/import";
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

export const astParserClassInterface: Parser<ClassType | undefined>
    = Parser.do(
        Parser.sat(/^: */),
        parseIdent,
        typeParser.many()
    ).map(([_, f, as]) => new ClassType(f, as)).optional();

export const astClassParser: Parser<Class>
    = Parser.do(
        astImportParser.post(parseNewline).many(),
        Parser.sat(/^type  */),
        parseIdent,
        parseIdent.many(),
        astParserClassInterface,
        iseq(astMemberTypeParser.disjointChoice(astMemberParser)),
    ).map(([is, _2, f, as, iface, ms]) => new Class(is, f, as, iface, ms));

export const astParser = Parser.sat(/\s*/).pre(astClassParser);

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