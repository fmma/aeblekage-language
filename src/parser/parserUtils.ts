import { Parser } from "./parser-combinators";

export class ParserUtils {
    parseIdent = Parser.sat(/^[A-Za-z_][A-Za-z0-9_]* */).map(x => x.trim());
    parseNewline = Parser.sat(/^\{n:\d*:\d*\} */);
    parseIndent = Parser.sat(/^\{i:\d*:\d*\} */);
    parseDedent = Parser.sat(/^\{d:\d*:\d*\} */);
    
    indentedSeq<A>(p: Parser<A>): Parser<A[]> {
        return this.parseIndent
            .pre(p.sepby(this.parseNewline))
            .post(this.parseDedent).choice(Parser.pure([]));
    }
    
    indentedSeq1<A>(p: Parser<A>): Parser<A[]> {
        return this.parseIndent
            .pre(p.sepby1(this.parseNewline))
            .post(this.parseDedent);
    }
}