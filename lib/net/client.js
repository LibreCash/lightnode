const
    Promise = require('bluebird'),
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
    url: '',
    requestFailCount: 0,
    connectionId: null
}

function setConnected(connected) {
    state.connected = connected;
    notifyStateChanged();
}

// events

function notifyStateChanged() {

}

// ping timer

async function startPingTimer() {
    this.pingTimerOn = true;
    pingTimer();
}

function stopPingTimer() {
    this.pingTimerOn = false;
}

async function pingTimer() {
    if (!this.pingTimerOn)
        return;
    
    await ping();

    Promise.delay(10000).then(pingTimer.bind(this));
}

// api

async function connect(options) {
    // todo: check options
    //  requestRetryCount
    settings = _.extend(options);
    state.url = 'http://' + options.host + ':' + options.port;
    state.requestFailCount = 0;

    console.log('client connect', state.url);
    
    await sendConnect();
}

function disconnect() {
    console.log('disconnect');
    stopPingTimer();
    sendDisconnect();
    setConnected(false);
    state.connectionId = null;
}

function getClientState() {
    return state;
}

// networking

function successRequest() {
    state.requestFailCount = 0;
}

function failRequest() {
    console.log('fail request');
    if (state.requestFailCount++ > settings.requestRetryCount) {
        disconnect();
    }
}

async function ping() {
    try {
        var res = await api.ping(state.url);
        console.log(res);
        successRequest();
    }
    catch (err) {
        logger.error('ping() error', err);
        failRequest();
    }
}

async function sendConnect() {
    try {
        var res = await api.connect(state.url);
        console.log(res);

        state.connectionId = res.connectionId;

        setConnected(true);
        successRequest();

        startPingTimer();

        return state.connectionId;
    }
    catch (err) {
        logger.error('connect() error', err);
    }
}

async function sendDisconnect() {
    try {
        var res = await api.disconnect(state.url, state.connectionId);
        console.log(res);
    }
    catch (err) {
        logger.error('disconnect() error', err);
    }
}

async function poolNotifications(options) {
    try {
        var res = await api.poolNotifications(state.url, state.connectionId, options.maxCount);
        console.log('poolNotifications', res);

        // todo: validate notifications

        notifications.concat(res.notifications);

        successRequest();
    }
    catch (err) {
        logger.error('poolNotifications() error', err);

        failRequest();
    }
}

async function getNodeState() {
    try {
        var res = await api.nodeState(state.url, state.connectionId);
        console.log('getNodeState', res);

        successRequest();
        
        return res;
    }
    catch (err) {
        logger.error('getNodeState() error', err);

        failRequest();
        
        return {
            error: err
        };
    }
}

async function getRates() {
    try {
        var res = await api.nodeRate(state.url, state.connectionId);
        console.log(res);

        successRequest();
        
        return res;
    }
    catch (err) {
        logger.error('getRates() error', err);

        failRequest();

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
