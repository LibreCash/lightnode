const
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    logger = require('../logger'),
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
                await this.addNetNodeDefault(this.options.lightnodes[i]);
            }

            var dbNodes = await db.getNetNodes();

            for (var i in dbNodes) {
                await this.addNetNodeDefault(dbNodes[i]);
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

    async addNetNodeDefault (node) {
        var options = {
            pingRate: this.options.pingRate,
            requestRetryCount: this.options.requestRetryCount,
            reconnectTimeout: this.options.reconnectTimeout,
            host: node.host,
            port: node.port,
        };
        await this.addNode(options);
    }

    async addNode (optionsNode) {
        var node = { // NEW NODE
            id: this.nodeId++,
            owner: this,
            connected: false,
            updateTimerOn: false,
            options: _.clone(optionsNode),
            avarageRate: 0,
            tickers: [],
            lastTickerIndex: 0,
            hasNewData: function () {
                return this.lastTickerIndex < this.tickers.length;
            },
            error: null,
            state: {}
        };

        node.client = new Client(optionsNode);
        
        logger.debug('addNode', node);
        
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
        logger.debug('removeNode', node);
        
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

    nodeById (id) {
        return this.nodes[id];
    }

    async nodeOn (node) {
        var client = node.client;
        await client.nodeOnOff('on');
    }

    async nodeOff (node) {
        var client = node.client;
        await client.nodeOnOff('off');
    }

    async nodeShutdown (node) {
        var client = node.client;
        await client.nodeOnOff('shutdown');
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
        
        logger.debug('MasterNode update node id='+node.id);

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

            // load tickers

            var tickers = await client.getTickers();
            if (!tickers.error)
                await this.updateTickers(node, tickers);
            else
                this.onNodeError(node.id, tickers.error);

            // get node state

            var nodeState = await client.getNodeState();
            if (!nodeState.error)
                node.state = nodeState.state;
            else
                this.onNodeError(node.id, nodeState.error);

            // pool notifications

            var notifications = await client.poolNotifications({index: -1, maxCount: 100});
            if (!notifications.error)
                this.processClientNotifications(notifications.notifications);
            else
                this.onNodeError(node.id, notifications.error);
        }
    }

    async updateTickers (node, tickers) {
        node.tickers = node.tickers.concat(tickers);

        this.saveData(tickers);

        // todo: remove
//        this.nodeProcessRatesAnalysis(node);
        
//        this.onNodeUpdateRates(node, rates);
    }
    
    async saveData(result) {
        logger.debug('saveData', result);

        db.saveTickers(result);
    }

    async checkNodes () {
        var processedNodes = [];
        for (var i in this.nodes) {
            var node = this.nodes[i];
            if (node.hasNewData()) {

                var count = node.tickers.length - node.lastTickerIndex;
                var avarageRate = 0;
                
                for (var j = 0; j < count; j++) {
                    var ticker = node.tickers[node.lastTickerIndex++];
                    var mid = parseFloat(ticker.mid);

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

/* todo: fix. temporarry disabled
            try {
                await eth.pushToBlockchain(finalAvarageRate);
            }
            catch (e) {
                notifications.error('ETH_PUSH_ERROR', finalAvarageRate);
            }*/
        }
    }

    processClientNotifications (notifications_) {
        logger.debug(notifications);
        notifications_.forEach((notification)=>{
            notifications.push('LIGHT_NODE_NOTIFICATION', notification);
        })
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

    onNodeError (nodeId, error) {
        this.emit('nodeError', error);

        notifications.error(error.code, {nodeId, error});
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
        
        logger.debug("✔ socket.io server listening on port %d", options.rc_port);

        var io = require('socket.io').listen(options.rc_port);

        this.io = io;

        io.sockets.on('connection', function (socket) {

            logger.debug('Client', socket.handshake.address);

            socket.emit('ping', {payload:'123'});
            
            socket.on('message', (msg) => self.rcDispachMessage(socket, msg));       
        });
    }

    rcDispachMessage (socket, msg) {
        logger.debug('ws_msg:', msg);

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
        // todo: test
        this.addNetNodeDefault(this.msg.node);
        db.addNetNode(this.msg.node);
    }

    rcRemoveNode (socket, msg) {
        // todo: test
        this.removeNetNode(this.msg.node);
        db.removeNetNode(this.msg.node);
    }

    rcNodeOp (socket, msg) {
        var payload = msg.payload;
        // node logic
        //  on/off
        //  unlock
        switch (payload.code) {
            case 'onoff':
                var node = this.nodeById(payload.id);
                if (!node) {
                    notifications.error('RC_BAD_REQUEST', `nodeOp ${JSON.stringify(msg)}`);
                    break;
                }
                if (payload.cmd == 'on')
                    this.nodeOn(node);
                else if (payload.cmd == 'off')
                    this.nodeOff(node);
                else if (payload.cmd == 'shutdown')
                    this.nodeShutdown(node);
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
