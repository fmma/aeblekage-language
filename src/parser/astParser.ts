import { Class } from "../ast/class/class";
import { ClassType } from "../ast/class/classType";
import { Import } from "../ast/class/import";
import { Member } from "../ast/class/member";
import { Members } from "../ast/class/members";
import { MemberType } from "../ast/class/memberType";
import { Type } from "../ast/type/type";
import { Tfun } from "../ast/type/fun";
import { ParserUtils } from "./parserUtils";
import { Parser } from "./parser-combinators";
import { StmtParser } from "./stmtParser";
import { TypeParser } from "./typeParser";
import { Binop } from "../binops";
import { IndentTokenizer } from "./indentTokenizer";

export class AstParser {

    constructor(
        readonly parserUtils: ParserUtils, 
        readonly binops: Binop[], 
        readonly typeParser: TypeParser, 
        readonly stmtParser: StmtParser,
        readonly indentTokenize: IndentTokenizer) {}

    readonly parseMemberIdent = Parser.choices(this.parserUtils.parseIdent, ...this.binops.map(x => Parser.sat(x.regexp).map(x => x.trim())));

    readonly astImportParser: Parser<Import>
        = Parser.do(
            Parser.sat(/^import  */),
            this.parserUtils.parseIdent.sepby1(Parser.sat(/^\./)),
            Parser.sat(/^\.\* */).map(_ => '*').optional()
        ).map(([_, xs, star]) => new Import(star ? [...xs, star] : xs));

    readonly astTypeSequenceParser: Parser<Type>
        = this.parserUtils.indentedSeq(this.typeParser.typeParser).map(ts => ts.reduceRight((t2, t1) => new Tfun(t1, t2)));

    readonly astMemberTypeParser: Parser<MemberType>
        = Parser.do(
            this.parseMemberIdent,
            this.parserUtils.parseIdent.many(),
            Parser.sat(/^: */),
            this.typeParser.typeParser.choice(this.astTypeSequenceParser)
        ).map(([f, as, _, t]) => new MemberType(f, as, t));

    readonly astMemberParser: Parser<Member>
        = Parser.do(
            this.parseMemberIdent,
            this.parserUtils.parseIdent.many(),
            Parser.sat(/^= */),
            this.stmtParser.stmtSequenceParser.fatal(this.indentTokenize, new Error(`Error in definition.`))
        ).map(
            (([f, as, _, ss]) => new Member(f, as, ss))
        );

    readonly astParserClassInterface: Parser<ClassType | undefined>
        = Parser.do(
            Parser.sat(/^: */),
            this.parserUtils.parseIdent,
            this.typeParser.typeAtomParser.many()
        ).map(([_, f, as]) => new ClassType(f, as)).optional();

    readonly astClassParser: Parser<Class>
        = Parser.do(
            this.astImportParser.post(this.parserUtils.parseNewline).many(),
            Parser.sat(/^type  */),
            this.parserUtils.parseIdent,
            this.parserUtils.parseIdent.many(),
            this.astParserClassInterface,
            this.parserUtils.indentedSeq(this.astMemberTypeParser.disjointChoice(this.astMemberParser).fatal(this.indentTokenize, new Error(''))),
        ).map(([is, _2, f, as, iface, ms]) => {
            return new Class(is, f, as, iface, Members.fromUnorderedList(ms))
        });


    readonly astParser = Parser.sat(/\s*/).pre(this.astClassParser);
}
