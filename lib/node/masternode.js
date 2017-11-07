const
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    db = require('../db'),
    Client = require('../net/client');

class MasterNode extends EventEmitter {
    constructor () {
        super();
        this.nodes = {};
        this.interval = null;
        this.nodeId = 1;

        // start

        db.connect('mongodb://localhost/masternode0');
    }
    
    // api

    async start (options) {
        for (var i in options.lightnodes) {
            var o = options.lightnodes[i];
            var optionsNode = {
                pingRate: options.pingRate,
                requestRetryCount: options.requestRetryCount,
                reconnectTimeout: options.reconnectTimeout,
                host: o.host,
                port: o.port,
            };
            await this.addNode(optionsNode);
        }
    }

    async addNode (optionsNode) {
        var node = { // NEW NODE
            id: this.nodeId++,
            owner: this,
            connected: false,
            updateTimerOn: false,
            options: _.extend(optionsNode),
            rates: []
        };

        node.client = new Client(optionsNode);
        
        console.log('addNode', node);
        
        // add

        this.nodes[node.id] = node;

        this.emit('nodeAdded', node);

        // start

        this.nodeStartUpdateTimer(node);
    }
    removeNode (node) {

    }

    // core

    nodeStartUpdateTimer (node) {
        if (!this.updateTimerOn) {
            this.updateTimerOn = true;
            node.updateTimerOn = true;
            this.updateAllNodes();
        }
    }
    nodeStopUpdateTimer (node) {
        this.updateTimerOn = false;
    }

    async updateAllNodes () {
        var nodesUpdated = 0;
        for (var i in this.nodes) {
            var node = this.nodes[i];
            if (!node.updateTimerOn)
                continue;
            this.update(node);
            nodesUpdated++;
        }

        this.checkNodes();

        if (nodesUpdated > 0) {
            // continue if nodes is updated
            Promise.delay(5000).then(this.updateAllNodes.bind(this));
        } else {
            // stop timer if all nodes is passed
            nodeStopUpdateTimer();
        }
    }

    async update (node) {
        var client = node.client;
        
        console.log('MasterNode update node id='+node.id);

        // connect 

        if (!node.connected) {
            await client.connect();
        }

        // load info

        var clientState = await client.getClientState();
        if (clientState.connected != node.connected) {
            if (!node.connected)
                this.onNodeConnected(node);
            else 
                this.onNodeDisconnected(node);
            node.connected = clientState.connected;
        }

        if (node.connected) {

            // load rates

            var rates = await client.getRates();

            if (rates) {
                await this.updateRates(node, rates);
            }

            var nodeState = await client.getNodeState();
        }
    }

    async updateRates (node, rates) {
        node.rates.push(rates);

        this.saveData(rates);

//        this.nodeProcessRatesAnalysis(node);
        
        this.onNodeUpdateRates(node, rates);
    }
    
    async saveData(result) {
        console.log('saveData', result);

        //db.addTickets(result);
    }
    /*
    async nodeProcessRatesAnalysis (node) {
        //... check prev, last & avarage < diff limit
        // ban node if fail
        // e-mail notification

    }*/

    async checkNodes () {
        for (var i in this.nodes) {
            var node = this.nodes[i];
        }
    }
    
    // events

    onNodeConnected (node) {
        this.emit('nodeConneted', node);
    }
    onNodeDisconnected (node) {
        this.emit('nodeDisconnected', node);
    }
    onNodeUpdateRates (node, rates) {
        this.emit('nodeRatesUpdated', rates);
    }
}

module.exports = MasterNode;

