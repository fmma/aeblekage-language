import { Parser } from "./parser-combinators";

export const parseIdent = Parser.sat(/^[A-Za-z_][A-Za-z0-9_]* */).map(x => x.trim());
export const parseNewline = Parser.sat(/^\{n:\d*:\d*\} */);
export const parseIndent = Parser.sat(/^\{i:\d*:\d*\} */);
export const parseDedent = Parser.sat(/^\{d:\d*:\d*\} */);

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