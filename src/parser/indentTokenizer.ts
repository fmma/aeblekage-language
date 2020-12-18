
export const INDENT = '\n{i}'
export const DEDENT = '\n{d}'
export const NEWLINE = '\n{nl}'

export function sanitizeSrc(string: string): string {
    const stack: (number | string)[] = [];
    const lines = string
        .replace(/\/\*([\s\S]*?)\*\//g, '')
        .split(/[\r\n]+/g).flatMap(((l) => sanitizeLine(stack, l)));

    while (stack[stack.length - 1] > 0) {
        stack.pop();
        lines.push(DEDENT);
    }
    return lines.join(' ');
}

function sanitizeLine(stack: (number | string)[], line: string): string[] {
    line = line.replace(/\/\/.*$/, '');

    const leadingSpaces = line.search(/\S/);
    if (leadingSpaces === -1)
        return [];

    const firstLine = stack.length === 0;
    if (firstLine)
        stack.push(0);
    const top = stack[stack.length - 1];
    const mode = typeof top === 'number';

    const result: string[] = [];
    if (mode) {
        if (top === leadingSpaces && !firstLine) {
            result.push(NEWLINE);
        }
        else if (top < leadingSpaces) {
            stack.push(leadingSpaces);
            result.push(INDENT);
        }
        let nl = false;
        while (stack[stack.length - 1] > leadingSpaces) {
            nl = true;
            stack.pop();
            result.push(DEDENT);
        }
        if (nl)
            result.push(NEWLINE);
    }
    for (let i = 0; i < line.length; ++i) {
        if ("({[".indexOf(line[i]) > -1) {
            stack.push(line[i]);
        }
        if (line[i] === ")" && stack.pop() !== "(")
            throw new Error("Parenthesis mismatch");
        if (line[i] === "]" && stack.pop() !== "[")
            throw new Error("Square brackets mismatch");
        if (line[i] === "}" && stack.pop() !== "{")
            throw new Error("Curly brackets mismatch");
    }

    result.push(line.substring(leadingSpaces));

    return result;
}
