const
    logger = require('./logger');

var
    db = null,
    owner = null;

function setDb(db_) {
    db = db_;
}

function setOwner(owner_) {
    owner = owner_;
}

function debug(code, ...message) {
    notify('debug', code, message);
}

function info(code, ...message) {
    notify('info', code, message);
}

function error(code, ...message) {
    notify('error', code, message);
}

function push(code, ...message) {
    notify('info', code, message);
}

// type - logger type
// code:
//  DB_ERROR    database error
//  NODE_*
//  

function notify(type, code, ...message) {
    logger.log(code, message);
    var notification = {
        nodeId: owner.nodeId,
        date: new Date(),
        code: code,
        object: message
    };

    try {
        db.addNotification(notification);
    } catch (e) {
        logger.error('DB_ERROR', `can't write to db`);
    }
    
    // notify owner
    switch (code) {
        case 'NODE_UNABLE_TO_CONNECT':
        case 'NODE_CONNECTED':
        case 'NODE_DISCONNECTED':
        case 'DB_ERROR':
            break;
        default:
            break;
    }
    owner.onNotification(notification);
}

module.exports = {
    setDb,
    setOwner,
    debug,
    info,
    error,
    push
}
