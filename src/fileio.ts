import { promises } from 'fs';
import globlib from 'glob';
import { astParser } from "./parser/astParser";
import { recoverSanitizedSrc, sanitizeSrc } from './parser/indentTokenizer';
import { Class } from './ast/class';

export class FileIO {

    libDirs = ['.'];

    fileCache: Record<string, Class | undefined> = {};
    globCache: Record<string, Class[] | undefined> = {};

    async requireImportFile(fp: string): Promise<Class> {
        const cachedValue = this.fileCache[fp];
        if (cachedValue)
            return cachedValue;
        let input = await promises.readFile(fp, "utf8");
        input = sanitizeSrc(input)
        const result = astParser.run(input);
        if (result == null)
            throw new Error(`Parse error in ${fp}. Tokens:\n${recoverSanitizedSrc(input)}`);
        if (result[1] < input.length)
            throw new Error(`Incomplete parse in ${fp}. Tokens:\n${recoverSanitizedSrc(input.substring(result[1]))}`)
        this.fileCache[fp] = result[0];
        return result[0];
    }

    async requireImportPath(path: string[]): Promise<Class[]> {
        const cachedValue = this.globCache[path.join('.')];
        if (cachedValue)
            return cachedValue;

        const paths = this.libDirs.flatMap(lib => [
            [lib, ...path].join('/') + '.æ',
            [lib, ...path, path[path.length - 1]].join('/') + '.æ'
        ]);
        const fps = await this.glob(paths);

        const result = await Promise.all(fps.map(fp => this.requireImportFile(fp)));
        this.globCache[path.join('.')] = result;
        return result;
    }

    async glob(pattern: string[]): Promise<string[]> {
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
}