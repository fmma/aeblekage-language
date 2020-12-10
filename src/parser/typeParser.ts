import { Type } from '../types/ast/type';
import { Tapp } from '../types/ast/type/app';
import { Tfun } from '../types/ast/type/fun';
import { Tvar } from '../types/ast/type/var';
import { parseIdent } from './common';
import { Parser } from './parser-combinators';

export const typeAtomParser: Parser<Type>
    = Parser.choices(
        parseIdent
            .map(x => new Tvar(x)),
        Parser.sat(/^\( */)
            .bind(_ => typeParser)
            .post(Parser.sat(/^\) */))
    );

export const typeAppParser: Parser<Type>
    = typeAtomParser
        .sepby1(Parser.pure(0))
        .map(ts => ts.reduce((t1, t2) => new Tapp(t1, t2)));

export const typeParser: Parser<Type>
    = typeAppParser
        .sepby1(Parser.sat(/^-> */))
        .map(ts => ts.reduceRight((t2, t1) => new Tfun(t1, t2)));
