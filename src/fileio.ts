import { join } from 'path';
import { promises, existsSync } from 'fs';
import { astParser } from "./parser/astParser";
import { sanitizeSrc } from './parser/indentTokenizer';
import { Class } from './types/ast/class';
import globlib from 'glob';

export const libDirs = ['.'];

export function whereis(path: string): string {
    for (let i = 0; i < libDirs.length; ++i) {
        const dir = join(libDirs[i], path);
        if (existsSync(dir))
            return dir;
    }
    throw new Error(`Cannot find file ${path}. Searched locations: ${libDirs.join(', ')}`);
}

const fileCache: Record<string, Class | undefined> = {};

export async function requireImport(path: string[]): Promise<Class> {
    const joinedPath = path.join('.');
    const cachedValue = fileCache[joinedPath];
    if (cachedValue)
        return cachedValue;
    let fp = whereis(path.join('/') + '.æ');
    let input = await promises.readFile(fp, "utf8");
    input = sanitizeSrc(input)
    const result = astParser.run(input);
    if (result == null)
        throw new Error(`Parse error in ${joinedPath}. Tokens:\n${input}`);
    if (result[1] < input.length)
        throw new Error(`Incomplete parse in ${joinedPath}. Tokens:\n${input.substring(result[1])}`)
    fileCache[joinedPath] = result[0];
    return result[0];
}

export async function glob(pattern: string[]): Promise<string[]> {
    const pat = pattern.length <= 1
        ? pattern[0] ?? ''
        : `{${pattern.join(',')}}`;
    return new Promise<string[]>((resolve, reject) => globlib(pat, (err, xs) => {
        if (err) {
            return reject(err);
        }
        return resolve(xs);
    }));
}