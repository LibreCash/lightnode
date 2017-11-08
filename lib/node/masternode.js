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
            tickets: [],
            lastTicketIndex: 0,
            hasNewData: function () {
                this.lastTicketIndex > tickets.length;
            },
            error: null
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

    function nodeError(node, code, message) {
        node.updateTimerOn = false;
        node.error = {code: code, message: message};
        //alert();
        logger.error(code, message);
        // e-mail notification
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

            // load tickets

            var tickets = await client.getTickets();

            if (tickets) {
                await this.updateTickets(node, rates);
            }

            var nodeState = await client.getNodeState();
        }
    }

    async updateTickets (node, tickets) {
        node.tickets.push(tickets);
        node.hasNewData = true;

        this.saveData(tickets);

//        this.nodeProcessRatesAnalysis(node);
        
//        this.onNodeUpdateRates(node, rates);
    }
    
    async saveData(result) {
        console.log('saveData', result);

        db.addTickets(result);
    }

    async checkNodes () {
        var processedNodes = [];
        var avarageRate = 0.;
        for (var i in this.nodes) {
            var node = this.nodes[i];
            if (node.hasNewData()) {
                var count = node.tickets.length - node.lastTicketIndex;
                for (var j = 0; j < count; j++) {
                    var ticket = node.tickets[node.lastTicketIndex++];
                    var mid = ticket.mid;

                    // verify node
                    var delta = mid - node.avarageRate;
                    var deltaMax = node.avarageRate * 1/5.;
                    if (Math.abs(delta) > deltaMax) {
                        nodeError(node, 'NODE_TICKET_DELTA_OVERFLOW', 'Node error: delta > deltaMax');
                        // stop processing node
                        break;
                    }

                    avarageRate += ;
                }

                avarageRate /= count;

                node.avarageRate = avarageRate;

                processedNodes.push(node);
            }
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

