const
    EventEmitter = require('events'),
    server = require('../net/server'),
    fetcher = require('./fetcher');

class LightNode extends EventEmitter {
    constructor (id) {
        super();
        this.id = id;
        this.connections = {};
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

        var rates = fetcher.fetch();

        updateRates(rates);

        Promise.delay(1000).then(this.update.bind(self));
    }

    async updateRates (rates) {
        this.rates = rates;
        onRatesUpdated();
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
