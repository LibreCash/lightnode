const
    _ = require('lodash'),
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
    state.connected = connected;
    notifyStateChanged();
}

// events

function notifyStateChanged() {

}

// ping

async function startPingTimer() {
    await ping();
}

function stopPingTimer() {

}

// api

async function connect(options) {
    settings = _.extend(options);
    state.url = 'http://' + options.host + ':' + options.port;
    await startPingTimer();
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

async function poolNotifications(options) {
    try {
        var res = await api.poolNotifications(state.url, options.maxCount);
        console.log(res);

        // todo: validate notifications

        notifications.concat(res.notifications);
    }
    catch (err) {
        logger.error('poolNotifications() error', err);
    }
}

async function getNodeState() {
    try {
        var res = await api.nodeState(state.url);
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

async function getRates() {
    try {
        var res = await api.nodeRate(state.url);
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
