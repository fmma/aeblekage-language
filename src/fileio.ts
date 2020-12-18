import { promises } from 'fs';
import globlib from 'glob';
import { astParser } from "./parser/astParser";
import { sanitizeSrc } from './parser/indentTokenizer';
import { Class } from './types/ast/class';

export const libDirs = ['.'];

const fileCache: Record<string, Class | undefined> = {};
const globCache: Record<string, Class[] | undefined> = {};

export async function requireImportFile(fp: string): Promise<Class> {
    const cachedValue = fileCache[fp];
    if (cachedValue)
        return cachedValue;
    let input = await promises.readFile(fp, "utf8");
    input = sanitizeSrc(input)
    const result = astParser.run(input);
    if (result == null)
        throw new Error(`Parse error in ${fp}. Tokens:\n${input}`);
    if (result[1] < input.length)
        throw new Error(`Incomplete parse in ${fp}. Tokens:\n${input.substring(result[1])}`)
    fileCache[fp] = result[0];
    return result[0];
}

export async function requireImportPath(path: string[]): Promise<Class[]> {
    const cachedValue = globCache[path.join('.')];
    if (cachedValue)
        return cachedValue;

    const paths = libDirs.flatMap(lib => [
        [lib, ...path].join('/') + '.æ',
        [lib, ...path, path[path.length - 1]].join('/') + '.æ'
    ]);
    const fps = await glob(paths);

    const result = await Promise.all(fps.map(fp => requireImportFile(fp)));
    globCache[path.join('.')] = result;
    return result;
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
