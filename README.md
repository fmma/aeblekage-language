# The Æblekage Programming Language!

Æblekage (from Danish: apple pie 🍏🥧) is yet another minimal and entirely uninteresting programming language.

# Features

* **Type inference** - Sound (I hope) and complete (probably) type inference with principal types (this I'm almost certain of).
* **OO-style classes and instances** - Higher-order generics, immutable instances, dot-member-access syntax. No sub-typing.
* **Whitespace sensitive syntax** - No braces or semicolons. Weird beginner-hostile parse rules.
* **Almost no dependencies** - I like to reinvent the deep plate.
* **VS CODE plugins** - LSP and syntax highlighting on the TODO list.
* **.æ file extention** - Most novel feature!

# Install

```
$ npm install aeblekage-language
```

# Usage
`./examples/maybe/maybe.æ`:
```
type Maybe a
    maybe b: b -> (a -> b) -> b
```

`./examples/maybe/just.æ`:
```
import examples.maybe

type Just a : Maybe a
    value: a

    maybe x f = f value
```

`./examples/maybe/nothing.æ`:
```
import examples.maybe

type Nothing a : Maybe a
    maybe x f = x
```

```
$ node cli.js examples/maybe/*
```

# Whitespace rules

```
f a
    b c
    d e
```
parses as `(f a) (b c) (d e)`


```
f
    g
        x
    h
        y
```
parses as `f (g x) (h y)`


```
f a
    .foo b c
    .bar d e
```
parses as `((f a).foo (b c)).bar (d e)`


```
f a
    .foo b c
        .bar d e
```
parses as `(f a).foo (b (c.bar (d e)))`

## TODO more principled whitespace parsing:

I want to support the following indented forms:

### App
```
Foo.Bar.Baz.someLongFunctionName
    Foo.Bar.Baz.firstArgumentWhichIsALongNameAlso
    f x y z (g x y z) (h y)
    Foo.Bar.Baz.thirdArgumentAlsoLong
```
`e_ id (sepby nl e) dd`

### DTO
```
Person
    name = "John"
    age = 20
    adress1 = "Some street 15"
```
`e_ id (sepby nl (ident = e)) dd`

### LINQ
```
xs
    .Where (x => x.foo > 2)
    .ToList
    .Select (x => x.foo)
    .OrderBy (x y => y - x)
    .Take (f 2 + 3)
    .Reduce (x y => x + y) 0
```
`e_ id (sepby nl (.ident e?)) dd`


### Mix App DTO LINQ
```
Person
    Name = 20
    .GetStringFunction // Person.GetStringFunction: string -> string -> string
    f "foo"
    f "bar"
```
Equivalent to `(Person 20).GetStringFunction (f "foo") (f "bar")`

### Nested ok
```
Person
    Name = 20
    .GetStringFunction
    g
        20 
        "foo"
    g
        30
        "bar"
```
Equivalent to `(Person 20).GetStringFunction (g 20 "foo") (g 30 "bar")`

### Algebraic
```
&&
    x == 2
    y == 3
    z == 10 || z == 11 
```
`binop id (sepby nl e) dd`

Equivalent to `x == 2 && y == 3 && (z == 10 || z == 11)`

### Def, let or lambda
```
foo =
    x = bar 20
    launchTheMissiles x
    IO.log "DONE"
    x
```
`F ::= ident = id (sepby nl (e | ident = e | F)) dd`

Let: `F nl e`
```
x =>
    x = bar 20
    launchTheMissiles x
    IO.log "DONE"
    x
```
`ident => id (sepby nl (e | ident = e | F)) dd`

### Long args/params
```
foo 
    longArgumentName1
    alsoLongArgumentName
    fooBarBaz
=
    x = bar 20
    launchTheMissiles x
    IO.log "DONE"
    x
    
```
`ident id (sepby nl ident) dd = id (sepby nl (e | ident = e | F)) dd`

# TODO

- Interpreter
- Main function
- Tokenizer: Replace current input sanitazion with actual token array with source spans.
- Better errors with source span info:
    - parser errors
    - typing errors (unification)
    - IO errors
- Cli arg parsing
- Test suite
- Benchmark suite
- DTO construtors with named arguments
- Native arrays
- Native dictionaries?
- Traditional syntax constructs?: 
    - Loops
    - If-then-else
    - Return
    - Try-catch
- Async?
- Yield-style iterators?
- Do-notation?
- Nullable types?
- Instance types: special members when type parameters are of a specific type (e.g. concat and sum).
- Static members: E.g. Monad.return
- Traits: Type of interfaces. Maybe copy (type)defs to interface. This would cause problems with monad-generic code.
    - Functor
    - Monad
    - Eq
- Codegen target
    - c
    - js
- More standard lib
    - IO
- Rename language to æselnumse (from Danish: ass ass 🐴🍑)
- VS CODE integration
    - language-server
    - syntax highlighting
