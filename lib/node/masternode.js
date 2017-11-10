const
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    db = require('../db'),
    Client = require('../net/client'),
    eth = require('../eth/eth');

class MasterNode extends EventEmitter {
    constructor () {
        super();
        this.nodes = {};
        this.interval = null;
        this.nodeId = 1;

        this.initState();

        this.state.id = 1;

        // start

        db.connect('mongodb://localhost/masternode0');

        eth.init();
    }

    initState () {
        this.state = {
            id: 0,
            startTime: new Date(),
            uptime: 0,
            lastUpdate: new Date(),
            lightNodesTotal: 0,
            lightNodesAlive: 0,
            finalAvarageRate: 0
        };
    }

    updateState () {
        // todo save to db

        this.rcGetState(this.io, null);
    }
    
    // api

    async start (options) {
        this.options = _.clone(options);
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

        this.remoteControlStart(options);
    }

    async addNode (optionsNode) {
        var node = { // NEW NODE
            id: this.nodeId++,
            owner: this,
            connected: false,
            updateTimerOn: false,
            options: _.clone(optionsNode),
            avarageRate: 0,
            tickets: [],
            lastTicketIndex: 0,
            hasNewData: function () {
                return this.lastTicketIndex < this.tickets.length;
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

        this.state.lightNodesTotal = this.nodes.length;
        this.updateState();
    }

    removeNode (node) {

    }

    nodeError (node, code, message) {
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
            node.connected = clientState.connected;
            if (node.connected)
                this.onNodeConnected(node);
            else 
                this.onNodeDisconnected(node);
        }

        if (node.connected) {

            // load tickets

            var tickets = await client.getTickets();

            if (tickets) {
                await this.updateTickets(node, tickets);
            }

            var nodeState = await client.getNodeState();
        }
    }

    async updateTickets (node, tickets) {
        node.tickets = node.tickets.concat(tickets);

        this.saveData(tickets);

//        this.nodeProcessRatesAnalysis(node);
        
//        this.onNodeUpdateRates(node, rates);
    }
    
    async saveData(result) {
        console.log('saveData', result);

        db.saveTickets(result);
    }

    async checkNodes () {
        var processedNodes = [];
        for (var i in this.nodes) {
            var node = this.nodes[i];
            if (node.hasNewData()) {

                var count = node.tickets.length - node.lastTicketIndex;
                var avarageRate = 0;
                
                for (var j = 0; j < count; j++) {
                    var ticket = node.tickets[node.lastTicketIndex++];
                    var mid = parseFloat(ticket.mid);

                    // verify node
                    var delta = mid - node.avarageRate;
                    if (node.avarageRate == 0)
                        delta = 0;
                    var deltaMax = node.avarageRate * 1/5;
                    if (Math.abs(delta) > deltaMax) {
                        nodeError(node, 'NODE_TICKET_DELTA_OVERFLOW', 'Node error: delta > deltaMax');
                        // stop processing node
                        break;
                    }

                    avarageRate += mid;
                }

                if (!node.error) {
                    avarageRate /= count;

                    node.avarageRate = avarageRate;

                    processedNodes.push(node);
                }
            }
        }

        // calc final

        if (processedNodes.length > 0) {
            var finalAvarageRate = 0;
            for (var i in processedNodes) {
                var node = processedNodes[i];
                finalAvarageRate += node.avarageRate;
            }

            finalAvarageRate /= processedNodes.length;

            this.state.finalAvarageRate = finalAvarageRate;

            this.updateState();

            // push to smart contract

            eth.pushToBlockchain(finalAvarageRate);
        }
    }

    // events
    
    onNodeConnected (node) {
        this.emit('nodeConneted', node);

        this.state.lightNodesAlive++;
        this.updateState();

        this.rcGetLightNodes(this.io, null);
    }
    onNodeDisconnected (node) {
        this.emit('nodeDisconnected', node);

        this.state.lightNodesAlive--;
        this.updateState();

        this.rcGetLightNodes(this.io, null);
    }
    onNodeUpdateRates (node, rates) {
        this.emit('nodeRatesUpdated', rates);

        this.updateState();
        this.rcGetLightNodes(this.io, null);
    }

    // remote control

    remoteControlStart (options) {
        // for dispatcher
        this.eventFns = {
            'pong': this.rcPong,
            'initConnection': this.rcInitConnection,
            'getState': this.rcGetState,
            'getLightNodes': this.rcGetLightNodes,
            'addNode': this.rcAddNode,
            'removeNode': this.rcRemoveNode,
            'nodeOp': this.rcNodeOp,
            'getEvents': this.rcGetEvents,
        };

        var self = this;
        
        console.log("✔ socket.io server listening on port %d", options.rc_port);

        var io = require('socket.io').listen(options.rc_port);

        this.io = io;

        io.sockets.on('connection', function (socket) {

            console.log('Client', socket.handshake.address);

            var time = (new Date).toLocaleTimeString();
//            socket.json.send({'event': 'connected', 'time': time});
/*            socket.on('pong', () => {
                console.log('pong');
            });*/
            socket.emit('ping', {payload:'123'});
            
            socket.on('message', (msg) => self.rcDispachMessage(socket, msg));       
        });
    }

    rcDispachMessage (socket, msg) {
        console.log('ws_msg:', msg);

        var eventFns = this.eventFns[msg.event];
        eventFns && eventFns.call(this, socket, msg);
    }

    rcPong (socket, msg) {
    }

    rcInitConnection (socket, msg) {
        // startup
        this.rcGetState(socket, msg);
        this.rcGetLightNodes(socket, msg);
        this.rcGetEvents(socket, msg);
    }

    rcGetState (socket, msg) {
        if (socket)
            socket.send({
                event: 'state',
                state: this.state
            });
    }

    rcGetLightNodes (socket, msg) {
        if (socket) {
            var nodes = []
            for (let [k, node] of Object.entries(this.nodes)) {
                var newNode = _.clone(node);
                delete newNode['owner'];
                delete newNode['client'];
                delete newNode['hasNewData'];
                nodes.push(newNode);
            }

            socket.send({
                event: 'lightNodes',
                nodes: nodes
            })
        }
    }

    rcAddNode (socket, msg) {
        this.addNode(this.msg.node);
    }

    rcRemoveNode (socket, msg) {
        this.removeNode(this.msg.node);
    }

    rcNodeOp (socket, msg) {
        // node logic
        //  on/off
        //  unlock
    }

    rcGetEvents (socket, msg) {
        // split log/notification
    }
}

module.exports = MasterNode;
