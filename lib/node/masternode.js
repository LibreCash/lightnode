const
    EventEmitter = require('events'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    logger = require('../logger'),
    db = require('../db'),
//    eth = require('../eth/eth'),
    notifications = require('../notification'),
    MasternodeNode = require('./masternode-node'),
    RemoteControl = require('./masternode-rc');

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
        
/** moved to lightnode
        eth.init(this.options.smartContract, this.onContractEvent);
*/

        this.rc = new RemoteControl(this, db);
        
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

        this.rc && this.rc.updateState();
    }
    
    set nodes (nodes) {
        this._nodes = nodes;
    }

    get nodes () {
        return this._nodes;
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
        var node = new MasternodeNode(this.nodeId++, optionsNode);
        
        logger.debug('addNode', node);
        
        // add

        this.nodes[node.id] = node;

        this.emit('nodeAdded', node);

        // start

        this.nodeStartUpdateTimer(node);

        this.rc && this.rc.updateLightNode(node);
        
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

/** moved to lightnode
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
            notifications.push('LIGHTNODE_NOTIFICATION', notification);
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

        this.rc && this.rc.updateLightNode(node);
    }
    
    async onNodeDisconnected (node) {
        this.emit('nodeDisconnected', node);

        this.state.lightNodesAlive--;
        await this.updateState();

        notifications.push('NODE_DISCONNECTED', {nodeId: node.id});

        this.rc && this.rc.updateLightNode(node);
    }

    async onNodeUpdateRates (node, rates) {
        this.emit('nodeRatesUpdated', node, rates);

        notifications.push('NODE_RATES_UPDATED', {nodeId: node.id});

        await this.updateState();

        this.rc && this.rc.updateLightNode(node);
    }

    onNodeError (nodeId, error) {
        this.emit('nodeError', error);

        notifications.error(error.code, {nodeId, error});
    }

    onNotification (notification) {
        this.emit('notification', notification);
        
        this.rc && this.rc.pushNotification(this.io, notification);
    }

/** moved to lightnode
    onContractEvent (type, error, event) {
        this.emit('notification', notification);
        
        notifications.push('CONTRACT_EVENT', {type, error, event});

        // todo: logic for events
    }
 */

    // remote control

    remoteControlStart (options) {
        this.rc && this.rc.start(options);
    }

    remoteControlStop () {
        this.rc && this.rc.stop();
    }
}

module.exports = MasterNode;
