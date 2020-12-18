import { Parser } from "./parser-combinators";

export const parseIdent = Parser.sat(/^[A-Za-z_][A-Za-z0-9_]* */).map(x => x.trim());
export const parseNewline = Parser.sat(/^\n\{nl\} */);
export const parseIndent = Parser.sat(/^\n\{i\} */);
export const parseDedent = Parser.sat(/^\n\{d\} */);

export function indentedSeq<A>(p: Parser<A>): Parser<A[]> {
    return parseIndent
        .pre(p.sepby(parseNewline))
        .post(parseDedent).choice(Parser.pure([]));
}

export function indentedSeq1<A>(p: Parser<A>): Parser<A[]> {
    return parseIndent
        .pre(p.sepby1(parseNewline))
        .post(parseDedent);
}