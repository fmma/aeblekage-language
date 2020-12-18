# The Æblekage Programming Language!
🍏🥧

Æblekage (from Danish: apple pie) is yet another minimal and entirely uninteresting programming language.

# Features

* **Type inference** - Sound (I hope) and complete (probably) type inference with principal types (this I'm almost certain of).
* **OO-style classes and interfaces** - Higher-order generics, immutable instances, no sub-typing.
* **Whitespace sensitive syntax** - No braces or semicolons.
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
