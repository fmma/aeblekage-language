export abstract class Ast {

    show(indent = 0, precedence = 0): string {
        return "<show not implemented>";
    }

    parenthesis(x: string, condition: boolean): string {
        return condition ? `(${x})` : x;
    }
}
