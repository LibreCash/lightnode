const winston = require('winston');

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            name: 'debug-console',
            json: false,
            prettyPrint: true,
            colorize: true
        }),
/*** disabled until fix log levels (too much data)
        new (winston.transports.File)({
            name: 'debug-file',
            filename: 'debug.log',
            json: false,
            prettyPrint: true
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'error-error.log',
            level: 'error',
            json: false,
            prettyPrint: true
        })*/
    ]
});

logger.level = 'debug';

// todo: log to masternode

function log(...args) {
    logger.log(...args);
    console.log(...args); //by vscode bug
}

function info(...args) {
    logger.info(...args);
    console.log(...args); //by vscode bug
}

function error(...args) {
    logger.error(...args);
    console.log(...args); //by vscode bug
}

function debug(...args) {
    logger.debug(...args);
    console.log(...args); //by vscode bug
}

module.exports = {
    log: log,
    info: info,
    error: error,
    debug: debug
}
