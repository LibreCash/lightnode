const
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    server = require('../net/server'),
    fetcher = require('./fetcher'),
    LightNodeState = require('../../models/LightNodeState'),
    db = require('../db');

class LightNode extends EventEmitter {
    constructor (id) {
        super();
        this.id = id;
        this.connections = {};
        this.server = server;
        this.rates = {};
        this.db = db;

        server.setNode(this);

        this.initState();

        var dburl = 'mongodb://localhost/lightnode' + id.toString();
        db.connect(dburl);
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
            startTime: new Date(),
            uptime: 0,
            lastUpdate: new Date()
        };
    }

    updateState () {
        this.state.lastUpdate = new Date();
        this.updateStateUptimeAndSave();
    }

    updateStateUptimeAndSave () {
        this.state.uptime = new Date().getTime() - this.state.startTime.getTime();
        this.saveState();
    }

    saveState () {
        var dbState = new LightNodeState({
            startTime: this.state.startTime,
            uptime: this.state.uptime,
            lastUpdate: this.state.lastUpdate
        });

        dbState.save();
    }

    exportState () {
        this.updateStateUptimeAndSave();

        return {
            startTime: this.state.startTime,
            uptime: this.state.uptime,
            lastUpdate: this.state.lastUpdate
        }
    }

    // api

    start (options) {
        var self = this;

        server.start(options, ()=>{
            self.onStarted();
        });

        this.startUpdateTimer();
    }

    stop () {
        server.stop(options, ()=>{
            onStopped();
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
        var self = this;
        if (!this.updateTimerOn)
            return;
        
        console.log('LightNode update node id='+this.id);

        var tickets = await fetcher.fetch();

        this.updateRates(tickets);

        Promise.delay(10000).then(this.update.bind(self));
    }

    // rates

    async updateRates (rates) {
        this.rates = rates;

        await db.saveTickets(rates);

        this.updateState();

        this.onRatesUpdated();
    }

    getRates () {
        return this.rates;
    }

    // events
    
    // todo: check local/remote namespaces & refactor

    onStarted () {
        this.emit('started');
        server.pushNotification({code: 'started'});
    }
    onStopped () {
        this.emit('stoped');
        server.pushNotification({code: 'started'});
    }
    onClientConnected (client) {
        this.emit('clientConnected', client);
        server.pushNotification({code: 'clientConnected'});
    }
    onClientDisconnected (client) {
        this.emit('clientDisconnected', client);
        server.pushNotification({code: 'clientDisonnected'});
    }
    onRatesUpdated () {
        this.emit('ratesUpdated');
        server.pushNotification({code: 'ratesUpdated'});
    }
}

module.exports = LightNode;
