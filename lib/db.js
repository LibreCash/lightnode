const mongoose = require('mongoose');
mongoose.Promise = Promise;

let
    logger = require('./logger'),
    Exchange2 = require('../models/Exchange');
//    Ticker = require('../models/Ticker'),
//    Notification = require('../models/Notification'),
//    Node = require('../models/Node');

var Schema = mongoose.Schema;

var Exchange = null;
var Ticker = null;
var Notification = null;
var Node = null;
var LightNodeState = null;

var MasterNodeState = null;

async function initModels(conn) {
    Exchange = conn.model('Exchange', new mongoose.Schema({
        name: { type: String, required: true, unique: true },
    }));

    Ticker = conn.model('Ticker', new mongoose.Schema({
        exchange: { type: Schema.Types.ObjectId, ref: 'exchangeSchema' },
        symbol: { type: String, required: true },
        mid: { type: Number, required: true },
        low: { type: Number, required: true },
        high: { type: Number, required: true },
        volume: { type: Number, required: true },
        timestamp: { type: Date, required: true }
    }));

    Notification = conn.model('Notification', new mongoose.Schema({
//        notificationsList: { type: Schema.Types.ObjectId, ref: 'notificationsListSchema' },
        nodeId: { type: String, required: true },
        date: { type: Date, required: true },
        code: { type: String, required: true },
        object: { type: String }, // todo
    }));

    Node = conn.model('Node', new mongoose.Schema({
//        nodesList: { type: Schema.Types.ObjectId, ref: 'nodesListSchema' },
        host: { type: String },
        port: { type: Number },
        state: { 
            type: String,
            enum: ['online', 'offline', 'banned'],
            default: ['offline'],
            required: true
        },
        error: { type: String }
    }));

    var lightNodeStateSchema = new Schema({
        nodeId: { type: String },
        startTime: { type: Date, required: true },
        uptime: { type: Date, required: true },
        lastUpdate: { type: Date, required: true }
    });
    LightNodeState = conn.model('LightNodeState', lightNodeStateSchema);

    MasterNodeState = conn.model('MasterNodeState', new Schema({
        id: { type: String },
        startTime: { type: Date, required: true },
        uptime: { type: Date, required: true },
        lastUpdate: { type: Date, required: true },
        lightNodesTotal: { type: Number, required: true },
        lightNodesAlive: { type: Number, required: true },
    }));
}

async function connect(url) {
    console.log('DB', url);
    // bug: https://stackoverflow.com/questions/19474712/mongoose-and-multiple-database-in-single-node-js-project
    var conn = await mongoose.createConnection(url);

    initModels(conn);

    await mongoose.connect(url, {
        useMongoClient: true
    });
}

async function saveTickets(result) {
    console.log('saveTickets', result);
    await result.forEach(async (item)=>{
        await this.addTicker(item);
    });
}

async function addTicker(ticker) {
    logger.debug('addTicker', ticker)
    // todo: underscore or check field, etc.
    if (!ticker || 
        !('name' in ticker) || !ticker.name ||
        !('high' in ticker) || !ticker.high ||
        !('low' in ticker) || !ticker.low ||
        !('volume' in ticker) || !ticker.volume) {
        logger.debug('error addTicker bad param:', ticker);
        return
    }
    var exchange = await Exchange.findOne({ name: ticker.name })
    if (!exchange) {
        exchange = new Exchange({
            name: ticker.name
        });
        await exchange.save();
    }
    ticker.exchange = exchange;
    ticker.symbol = `${ticker.name} USD/ETH`;
    ticker = new Ticker(ticker);
    await ticker.save();
}

async function getTickets() {
    var tickets = await Ticker.find();
    return tickets;
}

async function addNotification(notification) {
    notification = new Notification(notification);
    await notification.save();
}

async function addNode(node) {
    node = new Node(node);
    await node.save();
}

async function updateLightNodeState(state) {
    state = new LightNodeState({
        id: state.id,
        startTime: state.startTime,
        uptime: state.uptime,
        lastUpdate: state.lastUpdate
    });

    state.save();
}

async function updateMasterNodeState(state) {
    state = new MasterNodeState({
        id: state.id,
        startTime: state.startTime,
        uptime: state.uptime,
        lastUpdate: state.lastUpdate,
        lightNodesTotal: state.lightNodesTotal,
        lightNodesAlive: state.lightNodesAlive
    });

    await state.save();
}

module.exports = {
    connect,
    saveTickets,
    addTicker,
    getTickets,
    addNotification,
    addNode,
    updateLightNodeState,
    updateMasterNodeState
}
