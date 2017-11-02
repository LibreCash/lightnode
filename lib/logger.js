var winston = require('winston');

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            prettyPrint: true,
            colorize: true
        })
    ]
});

logger.level = 'debug';

// todo: log to masternode

function log(...args) {
    logger.log(args);
    console.log(args); //by vscode bug
}

function info(...args) {
    logger.info(args);
    console.log(args); //by vscode bug
}

function error(...args) {
    logger.error(args);
    console.log(args); //by vscode bug
}

function debug(...args) {
    logger.debug(args);
    console.log(args); //by vscode bug
}

module.exports = {
    log: log,
    info: info,
    error: error,
    debug: debug
}
