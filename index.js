#!/usr/bin/env node
const program = require('commander');
const action = require('./lib/action.js');

program.version(require('./package.json').version);

program
    .command('generate')
    .description('Generate dataset')
    .action(action.generate);

program
    .command('convert')
    .description('Convert output train dataset into RASA NLU')
    .action(action.convert);

program
    .command('train')
    .description('Train RASA NLU')
    .action(action.train);

program
    .command('bundle')
    .description('Run all commands (generate, convert and train)')
    .action(action.bundle);

program.arguments('<command>').action(command => {
    console.log(`Command ${command} not found\n`);
    program.outputHelp();
});

program.usage('<command>');

if (process.argv.length <= 2) {
    // If no command mentioned then output help
    program.outputHelp();
}

// Parse arguments
program.parse(process.argv);
