export default {
    input: 'dist/cli/cli.js',
    output: {
        file: 'cli.js',
        format: 'cjs'
    },
    external: ['fs', 'path', 'process', 'yargs', 'glob']
};
