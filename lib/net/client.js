const
    Promise = require('bluebird'),
    _ = require('lodash'),
    api = require('./client-api'),
    logger = require('../logger');

class Client {
    constructor (options) {
        // todo: check options
        //  requestRetryCount
        this.settings = _.clone(options);
        this.notifications = [];
        this.state = {
            connected: false,
            url: '',
            requestFailCount: 0,
            connectionId: null
        };
    }

    // notifications

    getNotifications () {
        return this.notifications;
    }

    // state

    setConnected (connected) {
        this.state.connected = connected;
        this.notifyStateChanged();
    }

    // events

    notifyStateChanged () {
    }

    // ping timer

    async startPingTimer () {
        this.pingTimerOn = true;
        this.pingTimer();
    }

    stopPingTimer () {
        this.pingTimerOn = false;
    }

    async pingTimer () {
        if (!this.pingTimerOn)
            return;
        
        await this.ping();

        Promise.delay(10000).then(this.pingTimer.bind(this));
    }

    // api

    async connect () {
        this.state.url = 'http://' + this.settings.host + ':' + this.settings.port;
        this.state.requestFailCount = 0;

        console.log('client connect', this.state.url);
        
        await this.sendConnect();
    }

    disconnect () {
        console.log('disconnect');
        this.stopPingTimer();
        this.sendDisconnect();
        this.setConnected(false);
        this.state.connectionId = null;
    }

    getClientState () {
        return this.state;
    }

    // networking

    successRequest () {
        this.state.requestFailCount = 0;
    }

    failRequest () {
        console.log('fail request');
        if (this.state.requestFailCount++ > this.settings.requestRetryCount) {
            this.disconnect();
        }
    }

    async ping () {
        try {
            var res = await api.ping(this.state.url);
            console.log(res);
            this.successRequest();
        }
        catch (err) {
            logger.error('ping() error', err);
            failRequest();
        }
    }

    async sendConnect () {
        try {
    //        var res = await api.connect(state.url, 'v1', settings.client.apiKey);
            var res = await api.connect(this.state.url, 'v1');
            console.log(res);

            this.state.connectionId = res.connectionId;

            this.setConnected(true);
            this.successRequest();

            this.startPingTimer();

            return this.state.connectionId;
        }
        catch (err) {
            logger.error('connect() error', err);
        }
    }

    async sendDisconnect () {
        try {
            var res = await api.disconnect(this.state.url, this.state.connectionId);
            console.log(res);
        }
        catch (err) {
            logger.error('disconnect() error', err);
        }
    }

    async poolNotifications (options) {
        try {
            var res = await api.poolNotifications(this.state.url, this.state.connectionId, options.maxCount);
            console.log('poolNotifications', res);

            // todo: validate notifications

            this.notifications.concat(res.notifications);

            this.successRequest();
        }
        catch (err) {
            logger.error('poolNotifications() error', err);

            this.failRequest();
        }
    }

    async getNodeState () {
        try {
            var res = await api.nodeState(this.state.url, this.state.connectionId);
            console.log('getNodeState', res);

            this.successRequest();
            
            return res;
        }
        catch (err) {
            logger.error('getNodeState() error', err);

            this.failRequest();
            
            return {
                error: err
            };
        }
    }

    async getTickets () {
        try {
            var res = await api.nodeTickets(this.state.url, this.state.connectionId);
            console.log(res);

            this.successRequest();
            
            return res;
        }
        catch (err) {
            logger.error('getTickets() error', err);

            this.failRequest();

            return {
                error: err
            };
        }
    }
}

module.exports = Client;
