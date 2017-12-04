const
    logger = require('../logger'),
    socketIo = require('socket.io'),
    socketioJwt = require('socketio-jwt');

class RemoteControl {

    constructor (owner, db) {
        this.owner = owner;
        this.db = db;
        this.running = false;
    }

    start (options) {
        if (this.running)
            return;
            
        // for dispatcher
        this.eventFns = {
            'pong': this.pong,
            'initConnection': this.initConnection,
            'getState': this.getState,
            'getLightNodes': this.getLightNodes,
            'addNode': this.addNode,
            'removeNode': this.removeNode,
            'nodeOp': this.nodeOp,
            'masterOn': this.masterOn
        };

        var self = this;
        
        logger.debug("✔ socket.io server listening on port %d", options.rc_port);

        // create

        var io = socketIo.listen(options.rc_port);

        this.io = io;

        // run

        this.running = true;

        io.sockets.on('connection', socketioJwt.authorize({
            secret: options.remoteControl.token,
            timeout: options.remoteControl.secret * 1000
          })).on('authenticated', function (socket) {

            logger.debug('Client', socket.handshake.address, 'token:', socket.decoded_token.name);
            
            socket.emit('ping', {payload:'123'});
            
            socket.on('message', (msg) => self.dispachMessage(socket, msg));       
        });
    }

    stop () {
        // todo: test
        if (this.running) {
            this.io.close();
            this.running = false;
        }
    }

    dispachMessage (socket, msg) {
        logger.debug('ws_msg:', msg);

        var eventFns = this.eventFns[msg.event];
        eventFns && eventFns.call(this, socket, msg);
    }

    pong (socket, msg) {
        // for testing purposes
    }

    initConnection (socket, msg) {
        // startup
        this.getState(socket, msg);
        this.getLightNodes(socket, msg);
    }

    getState (socket, msg) {
        if (socket)
            socket.send({
                event: 'state',
                state: this.state
            });
    }

    getLightNodes (socket, msg) {
        if (socket) {
            var nodes = []
            for (let [k, node] of Object.entries(owner.nodes())) {
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

    addNode (socket, msg) {
        // todo: test
        owner.addNetNodeDefault(msg.node);
        this.db.addNetNode(msg.node);
    }

    removeNode (socket, msg) {
        // todo: test
        owner.removeNetNode(msg.node);
        this.db.removeNetNode(msg.node);
    }

    nodeOp (socket, msg) {
        var payload = msg.payload;
        // node logic
        //  on/off
        //  unlock
        switch (payload.code) {
            case 'onoff':
                var node = owner.nodeById(payload.id);
                if (!node) {
                    notifications.error('RC_BAD_REQUEST', `nodeOp ${JSON.stringify(msg)}`);
                    break;
                }
                if (payload.cmd == 'on')
                    owner.nodeOn(node);
                else if (payload.cmd == 'off')
                    owner.nodeOff(node);
                else if (payload.cmd == 'shutdown')
                    owner.nodeShutdown(node);
                else
                    notifications.error('RC_BAD_REQUEST', `nodeOp ${JSON.stringify(msg)}`);
                break;
        }
    }

    masterOn (socket, msg) {
        if (msg.payload == 'on')
            owner.start();
        else if (msg.payload == 'off')
            owner.stop();
        else if (msg.payload == 'shutdown')
            owner.shutdown();
        else
            notifications.error('RC_BAD_REQUEST', `masterOn ${JSON.stringify(msg)}`);
    }

    pushNotification (socket, notification) {
        socket && socket.send({
            event: 'notification',
            notification
        });
    }

    updateLightNode (node) {
        this.getLightNodes(this.io, null);
    }

    updateState () {
        this.getState(this.io, null);
    }
}

module.exports = RemoteControl;
