var
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    logger = require('../logger'),
    server = require('../net/server'),
    fetcher = require('./fetcher'),
    LightNodeState = require('../../models/LightNodeState'),
    eth = require('../eth/eth'),
    db = require('../db'),
    utils = require('./utils');

// todo: refactor to new DB() & new Server(), multiple instances

var singleInstance = null;

class LightNode extends EventEmitter {
    constructor (id) {
        super();

        if (singleInstance)
            throw "Multiple instances is not supported";

        singleInstance = this;

        this.id = id;
        this.connections = {};
        this.server = server;
        this.rates = {};
        this.db = db;
        
        this.tickers = [];
        this.avarageRate = 0;
        this.tickersDeltaMax = 1/5;

        server.setNode(this);

        this.initState();
    }

    getId () {
        return this.id;
    }

    getDb () {
        return this.db;
    }

    // state

    initState () {
        this.state = {
            id: this.id,
            startTime: new Date(),
            uptime: 0,
            lastUpdate: new Date()
        };
    }

    async updateState () {
        this.state.lastUpdate = new Date();
        await this.updateStateUptimeAndSave();
    }

    async updateStateUptimeAndSave () {
        this.state.uptime = new Date().getTime() - this.state.startTime.getTime();

        await db.updateLightNodeState(this.state);
    }

    exportState () {
        this.updateStateUptimeAndSave();

        return {
            startTime: this.state.startTime,
            uptime: this.state.uptime,
            lastUpdate: this.state.lastUpdate
        };
    }

    // api

    async start (options = this.options) {
        if (!this.updateTimerOn) {
            this.options = options;

            logger.setLogLevel(options.logLevel);
            
            var self = this;

            this.dburl = options.db;
            
            await db.connect(this.dburl);

            await db.setupAccount({
                username: options.user,
                password: options.password
            });

            eth.init(this.options.smartContract, this.onContractEvent.bind(this));
            
            server.start(options, ()=>{
                self.onStarted();
            });

            this.startUpdateTimer();
        }
    }

    stop () {
        if (this.updateTimerOn) {
            this.stopUpdateTimer();
            this.onStopped();
        }
    }

    shutdown () {
        this.onShutdown();
        
        // delayed shutdown for notify ui
        Promise.delay(5000).then(()=>{
            process.exit(0);
        });
    }

    // core

    startUpdateTimer () {
        this.updateTimerOn = true;
        this.update();
    }

    stopUpdateTimer (node) {
        this.updateTimerOn = false;
    }

    async update (node) {
        if (!this.updateTimerOn)
            return;
        
        logger.debug('LightNode update node id='+this.id);

        var tickers = await fetcher.fetch();

        await this.updateTickers(tickers);

        Promise.delay(this.options.updateTimeout * 1000).then(this.update.bind(this));
    }

    // rates

    async updateTickers (tickers) {

        // check for errors
        tickers = tickers.filter(ticker => ticker.error == undefined);

        this.tickers = tickers;

        await db.saveTickers(tickers);

        var res = utils.processTickersAvarageRate(tickers, {
            avarageRate: this.avarageRate,
            deltaMax: this.tickersDeltaMax
        });

        if (!res.err) {
            this.avarageRate = res.avarageRate;
            
        }
        else {
            this.onError('NODE_TICKET_DELTA_OVERFLOW', 'Node error: delta > deltaMax');
        }

        await this.updateState();

        this.onRatesUpdated(res.err, this.avarageRate);
    }

    getTickers () {
        return this.tickers;
    }

    // events
    
    onStarted () {
        this.emit('started');
        server.pushNotification({code: 'NODE_STARTED'});
    }

    onStopped () {
        this.emit('stoped');
        server.pushNotification({code: 'NODE_STOPPED'});
    }

    onShutdown () {
        this.emit('shutdown');
        server.pushNotification({code: 'NODE_SHUTDOWN'});
    }

    onClientConnected (connection) {
        this.emit('clientConnected', connection);
        server.pushNotification({code: 'CLIENT_CONNECTED'});
    }

    onClientDisconnected (connection) {
        this.emit('clientDisconnected', connection);
        server.pushNotification({code: 'CLIENT_DISCONNECTED'});
    }

    onRatesUpdated (err, avarageRate) {
        this.emit('ratesUpdated');
        server.pushNotification({code: 'RATES_UPDATED', err, avarageRate});
    }

    onError (code, err) {
        this.emit('error', code);
        server.pushNotification({code, err});
    }

    onHttpError (err) {
        this.emit('httpError');
        server.pushNotification({code: 'HTTP_ERROR', error: err.message});
    }

    // contract

    onContractEvent (type, error, event) {
        this.emit('contractEvent', event);
        server.pushNotification({code: 'CONTRACT_EVENT', event});
        
        switch (type) {
            case 'NewOraclizeQuery':
                this.pushToBlockchain(this.avarageRate);
                break;
        }
    }

    onContractError (event) {
        this.emit('contractError', event);
        server.pushNotification({code: 'CONTRACT_ERROR', event});
    }

    async pushToBlockchain (rate) {
        try {
            await eth.pushToBlockchain(rate);
        }
        catch (e) {
            this.onContractError({code: 'ETH_PUSH_ERROR', rate});
        }
    }
}

module.exports = LightNode;
