import { Type } from '../ast/type/type';
import { Tapp } from '../ast/type/app';
import { Tfun } from '../ast/type/fun';
import { Tsymbol } from '../ast/type/symbol';
import { Tvar } from '../ast/type/var';
import { Polytype } from '../typing/polytype';
import { ParserUtils } from './parserUtils';
import { Parser } from './parser-combinators';

export class TypeParser {

    constructor(
        readonly parserUtils: ParserUtils
    ) { }

    readonly typeAtomParser: Parser<Type>
        = Parser.choices(
            Parser.sat(/^string */).map(_ => new Tsymbol('string')),
            Parser.sat(/^number */).map(_ => new Tsymbol('number')),
            this.parserUtils.parseIdent
                .map(x => new Tvar(x)),
            Parser.sat(/^\( */)
                .bind(_ => this.typeParser)
                .post(Parser.sat(/^\) */))
        );

    readonly typeAppParser: Parser<Type>
        = this.typeAtomParser
            .sepby1(Parser.pure(0))
            .map(ts => ts.reduce((t1, t2) => new Tapp(t1, t2)));

    readonly typeParser: Parser<Type>
        = this.typeAppParser
            .sepby1(Parser.sat(/^-> */))
            .map(ts => ts.reduceRight((t2, t1) => new Tfun(t1, t2)));

    readonly polytypeParser: Parser<Polytype>
        = Parser.do(
            Parser.sat(/^forall */),
            this.parserUtils.parseIdent.many(),
            Parser.sat(/^\. */),
            this.typeParser
        ).map(([_1, as, _2, t]) => new Polytype(as, t))
            .choice(this.typeParser.map(t => new Polytype([], t)));
}