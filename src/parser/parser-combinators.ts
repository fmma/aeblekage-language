const _cache: Record<string, Parser<any>> = {};

export class Parser<A> {
    constructor(readonly run: (cs: string) => [A, number] | undefined) {
    }

    static pure<A>(x: A): Parser<A> {
        return _cache[JSON.stringify(x)] ?? (_cache[JSON.stringify(x)] = new Parser(_ => [x, 0]));
    }

    static sat(regex: RegExp): Parser<string> {
        return _cache[String(regex)] ?? (_cache[String(regex)] = new Parser(cs => {
            const r = regex.exec(cs);
            if (r?.index == 0) {
                return [r[0], r[0].length];
            }
            return undefined;
        }));
    }

    static empty<A>(): Parser<A> {
        return _cache['empty'] ?? (_cache['empty'] = new Parser(_ => undefined));
    }

    map<A, B>(this: Parser<A>, f: (x: A) => B): Parser<B> {
        return new Parser(cs => {
            const r = this.run(cs);
            if (r == null)
                return r;
            const [x, i] = r;
            return [f(x), i];
        });
    }

    bind<B>(f: (x: A) => Parser<B>): Parser<B> {
        return new Parser(cs => {
            const r0 = this.run(cs);
            if (r0 == null)
                return r0;
            const [x, i0] = r0;
            const r1 = f(x).run(cs.substring(i0));
            if (r1 == null)
                return r1;
            const [y, i1] = r1;
            return [y, i0 + i1];
        });
    }

    pre<B>(p: Parser<B>): Parser<B> {
        return this.bind(_ => p);
    }

    post<B>(p: Parser<B>): Parser<A> {
        return this.bind(x => p.map(_ => x));
    }

    choice(p2: Parser<A>): Parser<A> {
        return new Parser(cs => this.run(cs) ?? p2.run(cs));
    }

    many(): Parser<A[]> {
        return new Parser(cs => {
            const ret = [[], 0] as [A[], number];
            while (true) {
                const r = this.run(cs.substring(ret[1]));
                if (r == null)
                    break;
                ret[0].push(r[0]);
                ret[1] += r[1];
            }
            return ret;
        });
    }

    many1(): Parser<A[]> {
        return this.bind(x =>
            this.many().bind(xs =>
                Parser.pure([x, ...xs])));
    }

    sepby<B>(psep: Parser<B>): Parser<A[]> {
        return this.sepby1(psep).choice(Parser.pure([]));
    }

    sepby1<B>(psep: Parser<B>): Parser<A[]> {
        return this.bind(x =>
            psep.bind(_ => this).many().bind(xs =>
                Parser.pure([x, ...xs])));
    }

    static choices<A>(...ps: Parser<A>[]): Parser<A> {
        return ps.reduce((p1, p2) => p1.choice(p2));
    }
}