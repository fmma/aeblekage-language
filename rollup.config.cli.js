export default {
    input: 'dist/cli/main.js',
    output: {
        file: 'cli.js',
        format: 'cjs'
    },
    external: ['fs', 'path', 'process', 'yargs', 'glob']
};
