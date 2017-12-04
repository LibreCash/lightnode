const
    logger = require('./logger');

function validationError(...error) {
    logger.error('ValidationError:', ...error);
    throw error;
}


function object(o, name) {
    if (o === null)
        validationError(`${name} is null`);
    if (typeof o !== 'object')
        validationError(`${name} is not object`);
}

function string(o, name) {
    if (typeof o !== 'string')
        validationError(`${name} is not string`);
}

function number(o, name) {
    if (typeof o !== 'number')
        validationError(`${name} is not string`);
}

function date(o, name) {
    if (!(o instanceof Date))
        validationError(`${name} is not Date`);
}

module.exports = {
    object,
    string,
    number,
    date
};
