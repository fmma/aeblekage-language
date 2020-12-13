concurrently -n tsc,rollup -c blue,green ^
    "tsc -w" ^
    "rollup -w -c rollup.config.cli.js"