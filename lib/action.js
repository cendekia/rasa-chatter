const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

const { spawnSync } = require('child_process');

const log = console.log;
const normal = chalk.bold.cyan;
const error = chalk.bold.grey;
const warning = chalk.bold.yellow;

function throwCreateIssueError(err) {
    log(
        error(
            'Uh-Oh! Would you mind to create an issue about this at https://github.com/cendekia/rasa-chatter with below log'
        )
    );
    log(error('Err:'));
    log(err);
}

async function generate() {
    const spinner = ora({
        text: `Generating dataset...\n`,
        spinner: 'hamburger',
    }).start();

    let generate = spawnSync('python3', ['-m', 'chatette', 'template/master.chat', '-f']);

    // log(error(`${generate.stderr.toString()}`));
    log(normal(`${generate.stdout.toString()}`));
    spinner.succeed('Successcully generated it.');
}

async function convert() {
    const spinner = ora({
        text: `Converting dataset...\n`,
        spinner: 'hamburger',
    }).start();

    convert = spawnSync('rasa', [
        'data',
        'convert',
        'nlu',
        '--data',
        `./output/train/output.json`,
        '--out',
        `./data/nlu.md`,
        '--format',
        `md`,
    ]);

    // log(error(`${convert.stderr.toString()}`))
    log(normal(`${convert.stdout.toString()}`));
    log(normal('Dataset has been converted into Rasa NLU'));
    spinner.succeed('Successcully converted it.');
}

async function train() {
    const spinner = ora({
        text: `Training dataset...\n`,
        spinner: 'hamburger',
    }).start();

    train = spawnSync('rasa', ['train']);

    // log(error(`${train.stderr.toString()}`))
    log(normal(`${train.stdout.toString()}`));
    spinner.succeed('Successcully train it.');
}

async function bundle() {
    generate();
    convert();
    train();
}

module.exports = { generate, convert, train, bundle };
