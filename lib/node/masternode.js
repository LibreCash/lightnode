const
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    db = require('../db'),
    Client = require('../net/client'),
    eth = require('../eth/eth'),
    notifications = require('../notification');

class MasterNode extends EventEmitter {
    constructor (options) {
        super();
        return new Promise(resolve => {
            this.options = _.clone(options);
            this.nodes = {};
            this.interval = null;
            this.nodeId = 1;

            this.initState();

            this.state.id = 1;

            this.init(options, resolve);
        });
    }

    async init(options, resolve) {
        notifications.setOwner(this);
        
        await db.connect(this.options.db);

        notifications.setDb(db);

        notifications.push('MASTERNODE_INITED', {id: this.state.id});
        
        eth.init(this.options.smartContract, this.onContractEvent);
        
        resolve(this);
    }
    
    initState () {
        this.state = {
            id: 0,
            startTime: new Date(),
            uptime: 0,
            lastUpdate: new Date(),
            lightNodesTotal: 0,
            lightNodesAlive: 0,
            finalAvarageRate: 0,
            running: false
        };
    }

    async updateState () {
        await db.updateMasterNodeState(this.state);

        this.rcUpdateState();
    }
    
    // api

    async start () {
        if (!this.state.running) {
            this.state.running = true;

            for (var i in this.options.lightnodes) {
                var o = this.options.lightnodes[i];
                var optionsNode = {
                    pingRate: this.options.pingRate,
                    requestRetryCount: this.options.requestRetryCount,
                    reconnectTimeout: this.options.reconnectTimeout,
                    host: o.host,
                    port: o.port,
                };
                await this.addNode(optionsNode);
            }

        }

        // todo: move rc to another place
        this.remoteControlStart(this.options);

        notifications.push('MASTERNODE_STARTED', {id: this.state.id});
    }

    async stop () {
        if (this.state.running) {
            this.state.running = false;

            await this.updateState();
            
            while (this.state.lightNodesTotal > 0) {
                await this.removeNode(Object.values(this.nodes)[0]);
            }
        }

        notifications.push('MASTERNODE_STOPPED', {id: this.state.id});
    }

    async shutdown () {
        notifications.push('MASTERNODE_SHUTDOWN', {id: this.state.id});

        // delayed shutdown for notify ui
        Promise.delay(5000).then(()=>{
            process.exit(0);
        });
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

        this.rcUpdateLightNode(node);
        
        this.state.lightNodesTotal++;
        await this.updateState();
    }

    async removeNode (node) {
        console.log('removeNode', node);
        
        this.nodeStopUpdateTimer(node);

        delete this.nodes[node.id];

        this.emit('nodeRemoved', node);
        
        this.state.lightNodesTotal--;
        await this.updateState();
    }

    // node control

    nodeError (node, code, message) {
        node.updateTimerOn = false;
        node.error = {code: code, message: message};
        //alert();
        logger.error(code, message);
        // e-mail notification

        this.onNodeConnectionError(node);
    }

    nodeOn (node) {
        // todo
    }

    nodeOff (node) {
        // todo
    }

    // core

    nodeStartUpdateTimer (node) {
        node.updateTimerOn = true;
        if (!this.updateTimerOn) {
            this.updateTimerOn = true;
            this.updateAllNodes();
        }
    }
    nodeStopUpdateTimer (node) {
        this.updateTimerOn = false;
    }

    async updateAllNodes () {
        // todo: parallel processing -> check nodes if processed
        //  PromiseAll, etc...

        var nodesUpdated = 0;
        for (var i in this.nodes) {
            var node = this.nodes[i];
            if (!node.updateTimerOn)
                continue;
            await this.update(node);
            nodesUpdated++;
        }

        this.checkNodes();

        if (nodesUpdated > 0) {
            // continue if nodes is updated
            Promise.delay(this.options.updateTimeout * 1000).then(this.updateAllNodes.bind(this));
        } else {
            // stop timer if all nodes is passed
            this.nodeStopUpdateTimer();
        }
    }

    async update (node) {
        var client = node.client;
        
        console.log('MasterNode update node id='+node.id);

        // connect 

        if (!node.connected) {
            var connectionId = await client.connect();
            if (!connectionId) {
                this.onNodeConnectionError(node);
            }
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

            if (!tickets.error) {
                await this.updateTickets(node, tickets);
            }

            // todo: node.state logic
            //  id,
            //  startTime,
            //  uptime,
            //  lastUpdate
            var nodeState = await client.getNodeState();
        }
    }

    async updateTickets (node, tickets) {
        node.tickets = node.tickets.concat(tickets);

        this.saveData(tickets);

        // todo: remove
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

            await this.updateState();

            // push to smart contract

            eth.pushToBlockchain(finalAvarageRate);
        }
    }

    // events
    
    onNodeConnectionError (node) {
        this.emit('nodeConnetionError', node);

        notifications.error('NODE_UNABLE_TO_CONNECT', {nodeId: node.id});
    }

    async onNodeConnected (node) {
        this.emit('nodeConneted', node);

        this.state.lightNodesAlive++;
        await this.updateState();

        notifications.push('NODE_CONNECTED', {nodeId: node.id});

        this.rcUpdateLightNode(node);
    }
    
    async onNodeDisconnected (node) {
        this.emit('nodeDisconnected', node);

        this.state.lightNodesAlive--;
        await this.updateState();

        notifications.push('NODE_DISCONNECTED', {nodeId: node.id});

        this.rcUpdateLightNode(node);
    }

    async onNodeUpdateRates (node, rates) {
        this.emit('nodeRatesUpdated', node, rates);

        notifications.push('NODE_RATES_UPDATED', {nodeId: node.id});

        await this.updateState();

        this.rcUpdateLightNode(node);
    }

    onNodeError (node) {
        this.emit('nodeError', node);

        notifications.error(node.error.code, {nodeId: node.id, error: node.error});
    }

    onNotification (notification) {
        this.emit('notification', notification);
        
        this.rcPushNotification(this.io, notification);
    }

    onContractEvent (type, error, event) {
        this.emit('notification', notification);
        
        notifications.push('CONTRACT_EVENT', {type, error, event});

        // todo: logic for events
    }

    // remote control

    remoteControlStart (options) {
        // skip if start twice
        if (this.io)
            return;
            
        // for dispatcher
        this.eventFns = {
            'pong': this.rcPong,
            'initConnection': this.rcInitConnection,
            'getState': this.rcGetState,
            'getLightNodes': this.rcGetLightNodes,
            'addNode': this.rcAddNode,
            'removeNode': this.rcRemoveNode,
            'nodeOp': this.rcNodeOp,
            'masterOn': this.rcMasterOn
        };

        var self = this;
        
        console.log("✔ socket.io server listening on port %d", options.rc_port);

        var io = require('socket.io').listen(options.rc_port);

        this.io = io;

        io.sockets.on('connection', function (socket) {

            console.log('Client', socket.handshake.address);

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
            });
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
        switch (msg.code) {
            case 'onoff':
                if (msg.payload == 'on')
                    this.nodeOn();
                else if (msg.payload == 'off')
                    this.nodeOff();
                else if (msg.payload == 'shutdown')
                    this.nodeShutdown();
                else
                    notifications.error('RC_BAD_REQUEST', `nodeOp ${JSON.stringify(msg)}`);
                break;
        }
    }

    rcMasterOn (socket, msg) {
        if (msg.payload == 'on')
            this.start(this.options);
        else if (msg.payload == 'off')
            this.stop();
        else if (msg.payload == 'shutdown')
            this.shutdown();
        else
            notifications.error('RC_BAD_REQUEST', `masterOn ${JSON.stringify(msg)}`);
    }

    rcPushNotification (socket, notification) {
        socket && socket.send({
            event: 'notification',
            notification
        });
    }

    rcUpdateLightNode (node) {
        this.rcGetLightNodes(this.io, null);
    }

    rcUpdateState () {
        this.rcGetState(this.io, null);
    }
}

module.exports = MasterNode;
