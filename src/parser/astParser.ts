import { binops } from "../binops";
import { Class } from "../ast/class";
import { ClassType } from "../ast/classType";
import { Import } from "../ast/import";
import { Member } from "../ast/member";
import { Members } from "../ast/members";
import { MemberType } from "../ast/memberType";
import { Type } from "../ast/type";
import { Tfun } from "../ast/type/fun";
import { indentedSeq, parseIdent, parseNewline } from "./common";
import { Parser } from "./parser-combinators";
import { stmtSequenceParser } from "./stmtParser";
import { typeAtomParser, typeParser } from "./typeParser";

export const parseMemberIdent = Parser.choices(parseIdent, ...binops.map(x => Parser.sat(x.regexp).map(x => x.trim())));

export const astImportParser: Parser<Import>
    = Parser.do(
        Parser.sat(/^import  */),
        parseIdent.sepby1(Parser.sat(/^\./)),
        Parser.sat(/^\.\* */).map(_ => '*').optional()
    ).map(([_, xs, star]) => new Import(star ? [...xs, star] : xs));

export const astTypeSequenceParser: Parser<Type>
    = indentedSeq(typeParser).map(ts => ts.reduceRight((t2, t1) => new Tfun(t1, t2)));

export const astMemberTypeParser: Parser<MemberType>
    = Parser.do(
        parseMemberIdent,
        parseIdent.many(),
        Parser.sat(/^: */),
        typeParser.choice(astTypeSequenceParser)
    ).map(([f, as, _, t]) => new MemberType(f, as, t));

export const astMemberParser: Parser<Member>
    = Parser.do(
        parseMemberIdent,
        parseIdent.many(),
        Parser.sat(/^= */),
        stmtSequenceParser.fatal(new Error(`Error in definition.`))
    ).map(
        (([f, as, _, ss]) => new Member(f, as, ss))
    );

export const astParserClassInterface: Parser<ClassType | undefined>
    = Parser.do(
        Parser.sat(/^: */),
        parseIdent,
        typeAtomParser.many()
    ).map(([_, f, as]) => new ClassType(f, as)).optional();

export const astClassParser: Parser<Class>
    = Parser.do(
        astImportParser.post(parseNewline).many(),
        Parser.sat(/^type  */),
        parseIdent,
        parseIdent.many(),
        astParserClassInterface,
        indentedSeq(astMemberTypeParser.disjointChoice(astMemberParser).fatal(new Error(''))),
    ).map(([is, _2, f, as, iface, ms]) => {
        return new Class(is, f, as, iface, Members.fromUnorderedList(ms))
    });


export const astParser = Parser.sat(/\s*/).pre(astClassParser);
