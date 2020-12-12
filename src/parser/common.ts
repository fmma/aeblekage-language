import { Parser } from "./parser-combinators";

export const parseIdent = Parser.sat(/^[A-Za-z_][A-Za-z0-9_]* */).map(x => x.trim());
export const parseNewline = Parser.sat(/^\nnl */);