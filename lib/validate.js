const
    logger = require('./logger'),
    validate = require('./validate');

function validationError(...error) {
    logger.error('ValidationError:', ...error);
    throw error;
}


function object(o, name) {
    if (ticker === null)
        validationError(`${name} is null`);
    if (ticker === null)
        validationError(`${name} is not object`);
}

module.exports = {
    object,
    string
}
