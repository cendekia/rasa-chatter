const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

const path = require('path');
const fs = require('fs');
const execa = require('execa');

const log = console.log;
const normal = chalk.bold.green;
const error = chalk.bold.grey;
const warning = chalk.bold.yellow;

const settings = require('../environment.json');

let spinOps = function(message) {
    return {
        text: `${message}\n`,
        spinner: 'hamburger',
        isEnabled: true
    };
};

function throwCreateIssueError(err) {
    log(
        error(
            'Uh-Oh! Would you mind to create an issue about this at https://github.com/cendekia/rasa-chatter with below log'
        )
    );
    log(error('Err:'));
    log(err);
}

function loadEnv() {
    const defaultSettings = settings.default_settings;
    let userSettings = settings.user_settings;
    let dslTemplate = defaultSettings.dsl_template;
    let jsonOutput = defaultSettings.json_output;
    let nluOutput = defaultSettings.rasa.nlu;

    if (Object.keys(userSettings).length !== 0) {
        dslTemplate = userSettings.dsl_template;
        jsonOutput = userSettings.json_output;
        nluOutput = userSettings.rasa.nlu;
    }
    
    const templatePath  = dslTemplate.path;
    const templateFile = (dslTemplate.extension == null) ? dslTemplate.filename : dslTemplate.filename + '.' + dslTemplate.extension;

    const outputPath = jsonOutput.path;
    const outputFile = jsonOutput.filename + '.' + jsonOutput.extension;

    const nluPath = nluOutput.path;
    const nluFile = (nluOutput.extension == null) ? nluOutput.filename : nluOutput.filename + '.' + nluOutput.extension;

    return {
        "dsl_file": templatePath + '/' + templateFile,
        "output_file": outputPath + '/' + outputFile,
        "nlu_file": nluPath + '/' + nluFile
    }
}

async function generate() {
    let spinner = ora(spinOps('Generating dataset...')).start();
    
    const env = loadEnv();
    
    try {
        const {stdout} = await execa('python3', ['-m', 'chatette', env.dsl_file, '-f']);
        log(normal(stdout));
        spinner.succeed('Successcully generated it.');
    } catch (error) {
        log(error(error));
        spinner.fail('Generating dataset was failed.');
    }
}

async function convert() {
    let spinner = ora(spinOps('Converting dataset...')).start();
    
    const env = loadEnv();
    
    try {
        const {stdout} = await execa('rasa', [
            'data',
            'convert',
            'nlu',
            '--data',
            `${env.output_file}`,
            '--out',
            `${env.nlu_file}`,
            '--format',
            `md`,
        ]);
        log(normal(stdout));
        spinner.succeed('Dataset has been converted into Rasa NLU.');
    } catch (error) {
        log(error(error));
        spinner.fail('Converting dataset was failed.');
    }
}

async function train() {
    let spinner = ora(spinOps('Training dataset...')).start();

    try {
        const {stdout} = await execa('rasa', ['train']);
        log(normal(stdout));
        spinner.succeed('Successcully train it.');
    } catch (error) {
        log(error(error));
        spinner.fail('Training dataset was failed.');
    }
}

async function bundle() {
    await generate();
    await convert();
    await train();
}

module.exports = { 
    generate,
    convert,
    train,
    bundle
};
