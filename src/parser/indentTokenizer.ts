
export function INDENT(ln: number, leadingSpaces: number): string {
    return `{i:${ln}:${leadingSpaces}}`;
}

export function DEDENT(ln: number, leadingSpaces: number): string {
    return `{d:${ln}:${leadingSpaces}}`;
}

export function NEWLINE(ln: number, leadingSpaces: number): string {
    return `{n:${ln}:${leadingSpaces}}`;
}

export function recoverSanitizedSrc(sanitized: string, ln?: number) {
    return sanitized
        .replace(/\{.:(\d*):(\d*)\}\ */g, (_, lineNumber, leadingSpaces) => {
            const result = '\n'.repeat(ln ? lineNumber - ln : 1) + ' '.repeat(leadingSpaces);
            ln = lineNumber;
            return result;
        });
}

export function sanitizeSrc(string: string): string {
    const stack: (number | string)[] = [];
    const lines = string
        .replace(/\/\*([\s\S]*?)\*\//g, '') // Remove multiline comments.
        .split(/\r?\n/) // Split lines.

    const sanitizedLines = lines
        .flatMap(((l, i) => sanitizeLine(stack, l, i)));

    while (stack[stack.length - 1] > 0) {
        stack.pop();
        sanitizedLines.push(DEDENT(lines.length, 0));
    }
    return sanitizedLines.join(' ');
}

function sanitizeLine(stack: (number | string)[], line: string, lineNumber: number): string[] {
    line = line.replace(/\/\/.*$/, ''); // Remove single line comments.

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
            result.push(NEWLINE(lineNumber, leadingSpaces));
        }
        else if (top < leadingSpaces) {
            stack.push(leadingSpaces);
            result.push(INDENT(lineNumber, leadingSpaces));
        }
        let nl = false;
        while (stack[stack.length - 1] > leadingSpaces) {
            nl = true;
            stack.pop();
            result.push(DEDENT(lineNumber, leadingSpaces));
        }
        if (nl)
            result.push(NEWLINE(lineNumber, leadingSpaces));
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
