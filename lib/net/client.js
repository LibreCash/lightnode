const
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    api = require('./client-api'),
    logger = require('../logger');

// todo: emit events for external monitoring
//  error/success
//      - connection
//      - request

class Client extends EventEmitter {
    constructor (options) {
        super();
        // todo: check options
        //  requestRetryCount
        this.settings = _.clone(options);
        this.state = {
            connected: false,
            url: '',
            requestFailCount: 0,
            connectionId: null
        };
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

        Promise.delay(this.settings.pingRate * 1000).then(this.pingTimer.bind(this));
    }

    // api

    async connect () {
        this.state.url = 'http://' + this.settings.host + ':' + this.settings.port;
        this.state.requestFailCount = 0;

        logger.debug('client connect', this.state.url);
        
/*        var loggedIn = await this.login('test', 'testpass');
        if (!loggedIn)
            return null;*/
        return await this.sendConnect();
    }

    disconnect () {
        logger.debug('disconnect');
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

    failRequest (error) {
        logger.debug('fail request', error);
        if (this.state.requestFailCount++ > this.settings.requestRetryCount ||
            (error && error.code == 'CONNECTION_NOT_FOUND')) {
            this.disconnect();
        }
    }

    async ping () {
        try {
            var res = await api.ping(this.state.url, this.state.connectionId);
//            logger.debug(`ping() ${JSON.stringify(res)}`);
            this.successRequest();
        }
        catch (err) {
            logger.error('ping() error', err);
            failRequest(err);
        }
    }

    async login(credentials) {
        try {
            var res = await api.login(this.state.url, 'test', 'testpass');
            logger.debug('login', res);

            this.successRequest();

            return true;
        }
        catch (err) {
            logger.error('login() error', err);

            return false;
        }
    }

    async sendConnect () {
        try {
    //        var res = await api.connect(state.url, 'v1', settings.client.apiKey);
            var res = await api.connect(this.state.url, 'v1');
//            logger.debug(res);

            this.state.connectionId = res.connectionId;

            this.setConnected(true);
            this.successRequest();

            this.startPingTimer();

            return this.state.connectionId;
        }
        catch (err) {
            logger.error('connect() error', err);
            return null;
        }
    }

    async sendDisconnect () {
        try {
            var res = await api.disconnect(this.state.url, this.state.connectionId);
//            logger.debug(res);
        }
        catch (err) {
            logger.error('disconnect() error', err);
        }
    }

    async poolNotifications (options) {
        try {
            var res = await api.poolNotifications(this.state.url, this.state.connectionId, options.index, options.maxCount);
//            logger.debug('poolNotifications', res);

            // todo: validate notifications

            this.successRequest();

            return res;
        }
        catch (err) {
            logger.error('poolNotifications() error', err);

            this.failRequest(err);

            return {
                error: err
            }
        }
    }

    async getNodeState () {
        try {
            var res = await api.nodeState(this.state.url, this.state.connectionId);
//            logger.debug('getNodeState', res);

            this.successRequest();
            
            return res;
        }
        catch (err) {
            logger.error('getNodeState() error', err);

            this.failRequest(err);
            
            return {
                error: err
            };
        }
    }

    async getTickers () {
        try {
            var res = await api.nodeTickers(this.state.url, this.state.connectionId);
//            logger.debug(res);

            this.successRequest();
            
            return res;
        }
        catch (err) {
            logger.error('getTickers() error', err);

            this.failRequest(err);

            return {
                error: err
            };
        }
    }

    async nodeOnOff (on) {
        try {
            var res = await api.nodeOnOff(this.state.url, this.state.connectionId, on);
//            logger.debug(res);

            this.successRequest();
            
            return res;
        }
        catch (err) {
            logger.error('nodeOnOff() error', err);

            this.failRequest(err);

            return {
                error: err
            };
        }
    }

    async nodeExchangeOnOff (on) {
        try {
            var res = await api.nodeExchangeOnOff(this.state.url, this.state.connectionId, on);
//            logger.debug(res);

            this.successRequest();
            
            return res;
        }
        catch (err) {
            logger.error('nodeExchangeOnOff() error', err);

            this.failRequest(err);

            return {
                error: err
            };
        }
    }
}

module.exports = Client;
