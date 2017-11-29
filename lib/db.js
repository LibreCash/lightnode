const mongoose = require('mongoose');
mongoose.Promise = Promise;

let
    logger = require('./logger'),
    passportLocalMongoose = require('passport-local-mongoose');
//    Exchange2 = require('../models/Exchange');
//    Ticker = require('../models/Ticker'),
//    Notification = require('../models/Notification'),
//    Node = require('../models/Node');

var Schema = mongoose.Schema;

var Account = null;

var Exchange = null;
var Ticker = null;
var Notification = null;
var NetNode = null;
var LightNodeState = null;

var MasterNodeState = null;

async function initModels(conn) {
    var accountSchema = new mongoose.Schema({
        username: String,
        password: String
    });

    accountSchema.plugin(passportLocalMongoose);

    Account = conn.model('Account', accountSchema);

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
        nodeId: { type: String, required: true },
        date: { type: Date, required: true },
        code: { type: String, required: true },
        object: { type: String }, // todo
    }));

    NetNode = conn.model('NetNode', new mongoose.Schema({
        name: { type: String},
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
    logger.debug('DB', url);
    var conn = await mongoose.createConnection(url);

    initModels(conn);

    await mongoose.connect(url, {
        useMongoClient: true
    });
}

/**
 * @title Set authentication account for remote nodes
 * @param options object: {username, password}
 */

function setAuthenticationAccount(account) {
    //Account.deleteAll

    account = new Account(account);

    await account.save();
}

function getPassportAccount() {
    return Account;
}

async function saveTickers(result) {
    logger.debug('saveTickers', result);
    await result.forEach(async (item)=>{
        await this.addTicker(item);
    });
}

async function addTicker(ticker) {
//    logger.debug('addTicker', ticker)
    logger.info(`addTicker ${JSON.stringify(ticker)}`)
    // todo: underscore or check field, etc.
    if (!ticker || 
        !('name' in ticker) || !ticker.name ||
        !('high' in ticker) || !ticker.high ||
        !('low' in ticker) || !ticker.low ||
        !('volume' in ticker) || !ticker.volume) {
        logger.error('error addTicker bad param:', ticker);
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

async function getTickers() {
    var tickers = await Ticker.find();
    return tickers;
}

async function addNotification(notification) {
    var notification = new Notification(notification);
    await notification.save();
}

async function addNetNode(node) {
    var node = new NetNode(node);
    await node.save();
}

async function removeNetNode(node) {
    await NetNode.remove({ id: node.id });
}

async function getNetNodes() {
    var nodes = await NetNode.find();
    return nodes;
}

async function updateLightNodeState(state) {
    var state = new LightNodeState({
        id: state.id,
        startTime: state.startTime,
        uptime: state.uptime,
        lastUpdate: state.lastUpdate
    });

    state.save();
}

async function updateMasterNodeState(state) {
    var state = new MasterNodeState({
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
    setAuthenticationAccount,
    getPassportAccount,
    saveTickers,
    addTicker,
    getTickers,
    addNotification,
    addNetNode,
    getNetNodes,
    updateLightNodeState,
    updateMasterNodeState
}
