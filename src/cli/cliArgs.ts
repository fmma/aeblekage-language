
import yargs from 'yargs';

export class CliArgsClass {
    cliArgs = yargs(process.argv.slice(2))
        .option('debug', {
            alias: 'd',
            type: 'boolean',
            description: 'Turn on debug info',
        })
        .option('dumpStackTraceOnError', {
            alias: 's',
            type: 'boolean'
        })
        .option('tokens', {
            type: 'boolean'
        })
        .strict()
        .usage('Usage: $0 [OPTIONS] SOURCE_FILE...')
        .argv;
}

export type CliArgs = typeof CliArgsClass.prototype.cliArgs;