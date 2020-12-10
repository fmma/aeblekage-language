import { promises } from 'fs';
import { astInterfaceParser } from '../parser/astParser';
import { sanitizeSrc } from '../parser/indentTokenizer';

(async () => {
    const args = process.argv.slice(2);
    let input = await promises.readFile(args[0], "utf8");
    console.log("input");
    console.log('--');
    input = sanitizeSrc(input)
    console.log("input");
    astInterfaceParser.run(input)?.[0].show(2);
    console.log("DONE");
})();
