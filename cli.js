#!/usr/bin/env node

const yargs = require('yargs');
const { retrieveDependenciesFromDirectory } = require('./src/fileIO');

let rootDir = '.';
let extensions = [];
let output = 'output';

const argv = yargs
    .option('e', {
        alias: 'extensions',
        description: 'Extensions to analyze',
        choices: ['php'],
        type: 'array',
    })
    .option('d', {
        alias: 'directory',
        description: 'Directory to analyze',
        type: 'string',
    }).
    option('o', {
        alias: 'output',
        description: 'Output file name (default=output)',
        type: 'string',
    })
    .help()
    .alias('v', 'version')
    .alias('h', 'help')
    .argv;

rootDir = argv.directory ? argv.directory : rootDir;
extensions = argv.extensions ? argv.extensions : extensions;
output = argv.output ? argv.output : output;

retrieveDependenciesFromDirectory(rootDir, extensions, output);
process.exit(0);