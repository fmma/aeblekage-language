
class Parser<A> {
    constructor(readonly run: (cs: string) => [A, number] | undefined) {

    }

    static pure<A>(x: A): Parser<A> {
        return new Parser(_ => [x, 0]);
    }

    static sat(regex: RegExp): Parser<string> {
        return new Parser(cs => {
            const r = regex.exec(cs);
            if (r?.index == 0) {
                return [r[0], r[0].length];
            }
            return undefined;
        });
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

    then<B>(f: (x: A) => Parser<B>): Parser<B> {
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

    choice<A>(p2: Parser<A>): Parser<A> {
        return new Parser(cs => {
            const r1 = this.run(cs);
            return r1 == null ? r1 : p2.run(cs);
        });
    }
}
