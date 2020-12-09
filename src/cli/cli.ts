import { typeParser } from "../parser/typeParser";

const args = process.argv.slice(2);
const input = args[0];
if(input != null)
    console.log(typeParser.run(input)?.[0].show());
