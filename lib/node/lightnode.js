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
        this.dburl = 'mongodb://localhost/lightnode' + id.toString();

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

    updateState () {
        this.state.lastUpdate = new Date();
        this.updateStateUptimeAndSave();
    }

    updateStateUptimeAndSave () {
        this.state.uptime = new Date().getTime() - this.state.startTime.getTime();

        db.updateLightNodeState(this.state);
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

    async start (options) {
        this.options = options;
        
        var self = this;

        await db.connect(this.dburl);

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
        if (!this.updateTimerOn)
            return;
        
        console.log('LightNode update node id='+this.id);

        var tickets = await fetcher.fetch();

        this.updateTickets(tickets);

        Promise.delay(this.options.updateTimeout * 1000).then(this.update.bind(this));
    }

    // rates

    async updateTickets (tickets) {
        this.tickets = tickets;

        await db.saveTickets(tickets);

        this.updateState();

        this.onRatesUpdated();
    }

    getTickets () {
        return this.tickets;
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
    onHttpError (err) {
        this.emit('httpError');
        server.pushNotification({code: 'httpError', error: err.message});
    }
}

module.exports = LightNode;
