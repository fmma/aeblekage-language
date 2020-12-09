import { Type } from '../types/ast/type';
import { Tapp } from '../types/ast/type/app';
import { Tfun } from '../types/ast/type/fun';
import { Tvar } from '../types/ast/type/var';
import { Parser } from './parser-combinators';

export const typeAtomParser: Parser<Type>
    = Parser.choices(
        Parser.sat(/^[A-Za-z_][A-Za-z0-9_]*\s*/)
            .map(x => new Tvar(x.trim())),
        Parser.sat(/^\(\s*/)
            .bind(_ => typeParser)
            .post(Parser.sat(/^\)\s*/))
    );

export const typeAppParser: Parser<Type>
    = typeAtomParser
        .sepby1(Parser.pure(0))
        .map(ts => ts.reduce((t1, t2) => new Tapp(t1, t2)));

export const typeParser: Parser<Type>
    = typeAppParser
        .sepby1(Parser.sat(/^->\s*/))
        .map(ts => ts.reduceRight((t2, t1) => new Tfun(t1, t2)));
