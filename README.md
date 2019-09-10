# rasa-chatter

[![rasa-chatter version](https://img.shields.io/npm/v/rasa-chatter.svg)](https://www.npmjs.org/package/rasa-chatter) [![rasa-chatter downloads](https://img.shields.io/npm/dt/rasa-chatter.svg)](http://npm-stat.com/charts.html?package=rasa-chatter) [![StyleCI](https://github.styleci.io/repos/206925793/shield?branch=master)](https://github.styleci.io/repos/206925793) [![contributions welcome to rasa-chatter](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/cendekia/rasa-chatter/issues) [![rasa-chatter license MIT](https://img.shields.io/npm/l/rasa-chatter.svg)](https://github.com/cendekia/rasa-chatter/blob/master/LICENSE)

[![https://nodei.co/npm/rasa-chatter.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/rasa-chatter.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/rasa-chatter)

rasa-chatter is a command tool to generate, manage, convert, and even train conversation from simgus/chatette dataset to Rasa NLU format.

---

## Installation
```shell
npm install -g rasa-chatter
```
---

## Commands

You can use `chatter <command>`

### Generate
Generate dataset into Rasa compatible train json data
```shell
chatter generate
```

### Convert
Convert train json data into Rasa NLU
```shell
chatter convert
```

### Train the data
Training NLU data into your bot
```shell
chatter train
```

### Bundle Command
optionally you can also directly use `bundle` command to run all the process (shortcut if we do back and fort training the data) 
```shell
chatter bundle
```
