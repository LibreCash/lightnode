const mongoose = require('mongoose');
mongoose.Promise = Promise;

const
    logger = require('./logger'),
    passportLocalMongoose = require('passport-local-mongoose');

var 
    Account,
    Exchange,
    Ticker,
    Notification,
    NetNode,
    LightNodeState,
    MasterNodeState;

async function initModels(conn) {
    Account = require('../models/Account').createModel(conn);
    Exchange = require('../models/Exchange').createModel(conn);
    Ticker = require('../models/Ticker').createModel(conn);
    Notification = require('../models/Notification').createModel(conn);
    NetNode = require('../models/NetNode').createModel(conn);
    LightNodeState = require('../models/LightNodeState').createModel(conn);
    MasterNodeState = require('../models/MasterNodeState').createModel(conn);
}

/**
 * @title Connect to mongo
 * @param url mongo url
 */

async function connect(url) {
    logger.debug('DB', url);
    var conn = await mongoose.createConnection(url);

    initModels(conn);

    await mongoose.connect(url, {
        useMongoClient: true
    });
}

/**
 * @title Setup authentication account for remote nodes
 * @param options object: {username, password}
 */

async function setupAccount(account) {
    //Account.deleteAll

    account = new Account(account);

    await account.save();
}

/**
 * @title Return Account model for passport
 */

function getAccountModel() {
    return Account;
}

/**
 * @title Save tickers
 * @param tickers array
 */

async function saveTickers(tickers) {
    logger.debug('saveTickers', tickers);
    await tickers.forEach(async (item)=>{
        await this.addTicker(item);
    });
}

/**
 * @title Add ticker to db
 * @param {*} ticker object
 */

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
    setupAccount,
    getAccountModel,
    saveTickers,
    addTicker,
    getTickers,
    addNotification,
    addNetNode,
    getNetNodes,
    updateLightNodeState,
    updateMasterNodeState
}
