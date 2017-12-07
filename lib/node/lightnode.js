var
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    logger = require('../logger'),
    server = require('../net/server'),
    fetcher = require('./fetcher'),
    LightNodeState = require('../../models/LightNodeState'),
    eth = require('../eth/eth'),
    db = require('../db');

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
        this.lastRate = null;
        this.db = db;
        
        this.dburl = 'mongodb://localhost/lightnode' + id.toString();
        this.tickers = [];

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
            
            var self = this;

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

        this.updateTickers(tickers);

        Promise.delay(this.options.updateTimeout * 1000).then(this.update.bind(this));
    }

    // rates

    async updateTickers (tickers) {

        // check for errors
        tickers = tickers.filter(ticker => ticker.error == undefined);

        this.tickers = tickers;

        await db.saveTickers(tickers);

        await this.updateState();

        this.onRatesUpdated();
    }

    getTickers () {
        return this.tickers;
    }

    // events
    
    // todo: check local/remote namespaces & refactor
    //  like notify('started'...) - common function for emit & notify

    onStarted () {
        this.emit('started');
        server.pushNotification({code: 'started'});
    }
    onStopped () {
        this.emit('stoped');
        server.pushNotification({code: 'stoped'});
    }
    onShutdown () {
        this.emit('shutdown');
        server.pushNotification({code: 'shutdown'});
    }
    onClientConnected (connection) {
        this.emit('clientConnected', connection);
        server.pushNotification({code: 'clientConnected'});
    }
    onClientDisconnected (connection) {
        this.emit('clientDisconnected', connection);
        server.pushNotification({code: 'clientDisonnected'});
    }
    onRatesUpdated () {
        this.emit('ratesUpdated');
        server.pushNotification({code: 'ratesUpdated'});
    }
    onHttpError (err) {
        this.emit('httpError');
        server.pushNotification({code: 'httpError', error: err.message});
    }

    onContractEvent (type, error, event) {
        this.emit('contractEvent', event);
        server.pushNotification({code: 'contractEvent', event});
        
        // todo: test

        switch (type) {
            case 'NewOraclizeQuery':
                this.pushToBlockchain(this.lastRate);
                break;
        }
    }

    onContractError (event) {
        this.emit('contractError', event);
        server.pushNotification({code: 'contractError', event});
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
