const
    api = require('./client-api'),
    logger = require('../logger');

var settings = {
}

// notifications

var notifications = [];

function getNotifications() {
    return notifications;
}

// state

var state = {
    connected: false,
    url: ''
}

function setConnected(connected) {
    state.connect = connected;
    notifyStateChanged();
}

// events

function notifyStateChanged() {

}

// ping

function startPingTimer() {
    ping();
    //Promise(()=> ping());
//    var asyncFunc = ms => new Promise(r => setTimeout(() => r(`await ${ms/1000}s`), ms))
    
}

function stopPingTimer() {

}

// api

function connect(options) {
    settings = options;
    state.url = 'http://' + options.host + ':' + options.port;
    startPingTimer();
}

function disconnect() {
    stopPingTimer();
    setConnected(false);
}

function getClientState() {
    return state;
}

// networking

async function ping() {
    try {
        var res = await api.ping(state.url);
        console.log(res);

        setConnected(true);
    }
    catch (err) {
        logger.error('connect() error', err);

        setConnected(false);
    }
}

function poolNotifications(options) {
    try {
        var res = api.poolNotifications(options.maxCount);
        console.log(res);

        // todo: validate notifications

        notifications.concat(res.notifications);
    }
    catch (err) {
        logger.error('poolNotifications() error', err);
    }
}

function getNodeState() {
    try {
        var res = api.getNodeState();
        console.log(res);

        return res;
    }
    catch (err) {
        logger.error('getNodeState() error', err);
        return {
            error: err
        };
    }
}

function getRates() {
    try {
        var res = api.getRates();
        console.log(res);

        return res;
    }
    catch (err) {
        logger.error('getRates() error', err);
        return {
            error: err
        };
    }
}


module.exports = {
    connect: connect,
    getClientState: getClientState,
    getNodeState: getNodeState,
    getRates: getRates,
    getNotifications: getNotifications
}
