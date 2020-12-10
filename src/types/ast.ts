export let _debugAlwaysShowParethesis = true;

export abstract class Ast {

    show(indent = 0, precedence = 0): string {
        return "<show not implemented>";
    }

    indentedLine(n: number, x: string): string {
        return ' '.repeat(n) + x + '\n';
    }

    parenthesis(x: string, condition: boolean): string {
        return _debugAlwaysShowParethesis || condition ? `(${x})` : x;
    }
}
