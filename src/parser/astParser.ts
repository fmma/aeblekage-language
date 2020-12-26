import { Class } from "../types/ast/class";
import { ClassType } from "../types/ast/classType";
import { Import } from "../types/ast/import";
import { Member } from "../types/ast/member";
import { MemberType } from "../types/ast/memberType";
import { Type } from "../types/ast/type";
import { Tfun } from "../types/ast/type/fun";
import { indentedSeq, parseIdent, parseNewline } from "./common";
import { Parser } from "./parser-combinators";
import { stmtSequenceParser } from "./stmtParser";
import { typeAtomParser, typeParser } from "./typeParser";

export const astImportParser: Parser<Import>
    = Parser.do(
        Parser.sat(/^import  */),
        parseIdent.sepby1(Parser.sat(/^\./)),
        Parser.sat(/^\.\* */).map(_ => '*').optional()
    ).map(([_, xs, star]) => new Import(star ? [...xs, star] : xs));

export const astMemberTypeParser: Parser<MemberType>
    = parseIdent.bind(f =>
        parseIdent.many().bind(as =>
            Parser.sat(/^: */).pre(typeParser.choice(astTypeSequenceParser).map(t =>
                new MemberType(f, as, t)))));

export const astMemberParser: Parser<Member>
    = parseIdent.bind(f => {
        return parseIdent.many().bind(as =>
            Parser.sat(/^= */).pre(stmtSequenceParser.fatal(new Error(`Error in definition ${f}.`)))
                .map(ss => new Member(f, as, ss)))
    });

export const astTypeSequenceParser: Parser<Type>
    = indentedSeq(typeParser).map(ts => ts.reduceRight((t2, t1) => new Tfun(t1, t2)));

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
    ).map(([is, _2, f, as, iface, ms]) => new Class(is, f, as, iface, ms));

export const astParser = Parser.sat(/\s*/).pre(astClassParser);
