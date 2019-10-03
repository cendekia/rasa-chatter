const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

const path = require('path');
const fs = require('fs');
const execa = require('execa');

const log = console.log;
const normal = chalk.bold.green;
const error = chalk.bold.red;
const warning = chalk.bold.grey;

const settings = require('../environment.json');
let newSetting = settings.default_settings;
let currentProject = {};
let defaultRasaFormat = 'md';

let spinOps = function(message) {
    return {
        text: `${message}\n`,
        spinner: 'hamburger',
        isEnabled: true,
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

    const templatePath = dslTemplate.path;
    const templateFile =
        dslTemplate.extension == null ? dslTemplate.filename : dslTemplate.filename + '.' + dslTemplate.extension;

    const outputPath = jsonOutput.path;
    const outputFile = jsonOutput.filename + '.' + jsonOutput.extension;

    const nluPath = nluOutput.path;
    const nluFile = nluOutput.extension == null ? nluOutput.filename : nluOutput.filename + '.' + nluOutput.extension;

    return {
        dsl_file: templatePath + '/' + templateFile,
        output_file: outputPath + '/' + outputFile,
        nlu_file: nluPath + '/' + nluFile,
    };
}

async function init(project = '.') {
    let newProject = {};
    newProject.path = path.resolve(project);
    newProject.name = newProject.path.split(path.sep).pop();

    var questions = [
        {
            type: 'input',
            name: 'project_name',
            message: 'Register your Rasa project name:',
            default: newProject.name
        },
        {
            type: 'input',
            name: 'project_path',
            message: 'Please add path of your project:',
            default: newProject.path
        },
        {
            type: 'input',
            name: 'dsl_template_path',
            message: 'Set your dsl template path:',
            default: newSetting.dsl_template.path
        },
        {
            type: 'input',
            name: 'dsl_template_filename',
            message: 'Set your dsl main template filename:',
            default: newSetting.dsl_template.filename
        },
        {
            type: 'input',
            name: 'dsl_template_extension',
            message: 'Set your dsl main template extension:',
            default: newSetting.dsl_template.extension
        },
        {
            type: 'input',
            name: 'json_output_path',
            message: 'Set your path to the file or directory containing Rasa NLU data:',
            default: newSetting.json_output.path
        },
        {
            type: 'input',
            name: 'json_output_filename',
            message: 'Set your Rasa NLU filename:',
            default: newSetting.json_output.filename
        },
        {
            type: 'input',
            name: 'nlu_path',
            message: 'Set your nlu output path:',
            default: newSetting.rasa.nlu.path
        },
        {
            type: 'input',
            name: 'nlu_filename',
            message: 'Set your nlu output filename:',
            default: newSetting.rasa.nlu.filename
        },
        {
            type: 'list',
            name: 'nlu_extension',
            message: 'Set your nlu output format (markdown or json):',
            default: newSetting.rasa.nlu.filename,
            choices: ['Markdown format', 'Json format'],
            filter: function(val) {
                if (val == 'Json format') {
                    defaultRasaFormat = 'json'
                }
                
                return defaultRasaFormat;
            }
        },
    ];

    inquirer
        .prompt(questions)
        .then(answers => {
            if(settings.user_settings.some(setting => setting.project.name.toLowerCase() == answers.project_name.toLowerCase())){
                log(warning(`Rasa project with this name (${answers.project_name}) already exists`));
                return init();
            }

            newProject.path = answers.project_path;
            newProject.name = answers.project_name;
            
            newSetting.project = newProject;
            newSetting.dsl_template = {
                "path": answers.dsl_template_path,
                "filename": answers.dsl_template_filename,
                "extension": answers.dsl_template_extension
            };

            newSetting.json_output = {
                "path": answers.json_output_path,
                "filename": answers.json_output_filename,
                "extension": newSetting.json_output.extension
            };

            newSetting.rasa.nlu = {
                "path": answers.nlu_path,
                "filename": answers.nlu_filename,
                "extension": answers.nlu_extension
            };

            settings.user_settings.push(newSetting);

            console.log('\nYour current rasa-chatter settings:');
            console.log(JSON.stringify(newSetting, null, '  '));
        });
}

async function generate() {
    let spinner = ora(spinOps('🤖 Generating dataset by run')).start();

    const env = loadEnv();

    try {
        const { stdout, stderr } = await execa('python3', ['-m', 'chatette', env.dsl_file, '-f']);
        
        if (stdout) { 
            spinner.fail(stdout);
        } else {
            spinner.succeed('Successcully generated it');
        }
    } catch (error) {
        spinner.warn('🤖 Your command was');
        log(normal('     ' + error.command));
        spinner.warn(error.all);
        spinner.fail('🤖 Generating dataset is failed.');
    }
}

async function convert() {
    let spinner = ora(spinOps('Converting dataset...')).start();

    const env = loadEnv();

    try {
        const { stdout, stderr } = await execa('rasa', [
            'data',
            'convert',
            'nlu',
            '--data',
            `${env.output_file}`,
            '--out',
            `${env.nlu_file}`,
            '--format',
            `${defaultRasaFormat}`,
        ]);

        log(warning(stderr));

        if (stdout) {
            spinner.fail(stdout);
        } else {
            spinner.succeed('Successcully convert it');
        }
    } catch (error) {
        console.log(error);
        spinner.fail("Training dataset was failed.");
    }
}

async function train() {
    let spinner = ora(spinOps('Training dataset...')).start();

    try {
        const { stdout, stderr } = await execa('rasa', ['train', '--quiet']);
        log(warning(stderr));
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
    init,
    generate,
    convert,
    train,
    bundle,
};
