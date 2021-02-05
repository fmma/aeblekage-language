import { promises } from "fs";
import { parseBinopConfig } from "../binops";
import { FileIO } from "../fileio";
import { AstParser } from '../parser/astParser';
import { ExprParser } from '../parser/exprParser';
import { IndentTokenizer } from "../parser/indentTokenizer";
import { ParserUtils } from '../parser/parserUtils';
import { StmtParser } from '../parser/stmtParser';
import { TypeParser } from '../parser/typeParser';
import { CliArgs } from "./cliArgs";

export async function configureServices(clientArgs: CliArgs) {
    const binopConfigFile = await promises.readFile('./src/binops.json');
    const binopsPrecedenceHiearchery = parseBinopConfig(JSON.parse(binopConfigFile.toString()));
    const indentTokenizer = new IndentTokenizer();
    const commen = new ParserUtils();
    const typeParser = new TypeParser(commen);
    const exprParser = new ExprParser(commen, binopsPrecedenceHiearchery);
    const stmtParser = new StmtParser(exprParser, commen);
    const astParser = new AstParser(commen, binopsPrecedenceHiearchery.allBinops(), typeParser, stmtParser, indentTokenizer);
    const fileIO = new FileIO(astParser, indentTokenizer);
    return {
        binopsPrecedenceHiearchery: binopsPrecedenceHiearchery,
        commen: commen,
        typeParser: typeParser,
        exprParser: exprParser,
        stmtParser: stmtParser,
        astParser: astParser,
        indentTokenizer: indentTokenizer,
        fileIO: fileIO,
    };
}

export type Services = ReturnType<typeof configureServices> extends Promise<infer U> ? U : never;
