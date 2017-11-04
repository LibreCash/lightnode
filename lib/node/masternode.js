const
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    db = require('../db'),
    client = require('../net/client');

class MasterNode extends EventEmitter {
    constructor () {
        super();
        this.nodes = {};
        this.interval = null;
        this.nodeId = 1;

        // start

        db.connect('mongodb://localhost/test');
    }
    
    // api

    async addNode (optionsNode) {
        var node = { // NEW NODE
            id: this.nodeId++,
            owner: this,
            connected: false,
            updateTimerOn: false,
            options: _.extend(optionsNode),
            rates: []
        };
        
        console.log('addNode', node);
        
        // add

        nodes.push(node);

        this.emit('nodeAdded', node);

        // start

        this.startUpdateTimer(node);
    }
    removeNode (node) {

    }

    // core

    nodeStartUpdateTimer (node) {
        node.updateTimerOn = true;
        this.update();
    }
    nodeStopUpdateTimer (node) {
        node.updateTimerOn = false;
    }

    async update (node) {
        var self = this;
        if (!node.updateTimerOn)
            return;
        
        console.log('MasterNode update node id='+node.id);

        // connect 

        if (!node.connected) {
            await client.connect(node.options);
        }

        // load info

        var nodeState = client.getNodeState();
        if (nodeState.connected != nodeState.connected) {
            if (!node.connected)
                this.onNodeConnected(node);
            else 
                this.onNodeDisconnected(node);
            node.connected = nodeState.connected;
        }

        if (node.connected) {

            // load rates

            var rates = await client.getRates();

            if (rates) {
                await updateRates(node, rates);
            }
        }

        Promise.delay(1000).then(this.update.bind(self));
    }

    async updateRates (node, rates) {
        node.rates.push(rates);

        saveData(rates);

        nodeProcessRatesAnalysis(node);
        
        onNodeUpdateRates(node, rates);
    }
    
    async saveData(result) {
/*        await result.forEach((item)=>{
            if (item instanceof Array) {
                item.forEach((item1)=>{
                    db.addTicker(item1);
                })
            }
            else {
                db.addTicker(item);
            }
        })*/
    }
    
    async nodeProcessRatesAnalysis (node) {
        //... check prev, last & avarage < diff limit
        // ban node if fail
        // e-mail notification
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

