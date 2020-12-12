import { Type } from '../types/ast/type';
import { Tapp } from '../types/ast/type/app';
import { Tfun } from '../types/ast/type/fun';
import { Tsymbol } from '../types/ast/type/symbol';
import { Tvar } from '../types/ast/type/var';
import { Polytype } from '../typing/polytype';
import { parseIdent } from './common';
import { Parser } from './parser-combinators';

export const typeAtomParser: Parser<Type>
    = Parser.choices(
        Parser.sat(/^string */).map(_ => new Tsymbol('string')),
        Parser.sat(/^number */).map(_ => new Tsymbol('number')),
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

export const polytypeParser: Parser<Polytype>
    = Parser.do(
        Parser.sat(/^forall */),
        parseIdent.many(),
        Parser.sat(/^\. */),
        typeParser
    ).map(([_1, as, _2, t]) => new Polytype(as, t));