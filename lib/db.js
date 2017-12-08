const mongoose = require('mongoose');
mongoose.Promise = Promise;

const
    passportLocalMongoose = require('passport-local-mongoose'),
    logger = require('./logger'),
    validate = require('./validate');
    
var 
    Account,
    Exchange,
    Ticker,
    Notification,
    NetNode,
    LightNodeState,
    MasterNodeState;

function initModels(conn) {
    Account = require('../models/Account').createModel(conn);
    Exchange = require('../models/Exchange').createModel(conn);
    Ticker = require('../models/Ticker').createModel(conn);
    Notification = require('../models/Notification').createModel(conn);
    NetNode = require('../models/NetNode').createModel(conn);
    LightNodeState = require('../models/LightNodeState').createModel(conn);
    MasterNodeState = require('../models/MasterNodeState').createModel(conn);
}

/**
 * Connect to mongo
 * @param {string} url mongo url
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
 * Setup authentication account for remote nodes
 * @param {Credentials} options {username, password}
 */

async function setupAccount(account) {
    //Account.deleteAll

    account = new Account(account);
    account.save((res,err)=>{
        console.log(res,err);
    });

    await account.save();
}

/**
 * Return Account model for passport
 * @returns {Account} Account model
 */

function getAccountModel() {
    return Account;
}

/**
 * Save tickers
 * @param {array} tickers Tickers array
 */

async function saveTickers(tickers) {
    logger.debug('saveTickers', tickers);
    await tickers.forEach(async (item)=>{
        await this.addTicker(item);
    });
}

/**
 * Add ticker to db
 * @param {Ticker} ticker Ticker object
 */

async function addTicker(ticker) {
    logger.debug(`addTicker ${JSON.stringify(ticker)}`)

    validate.object(ticker, 'addTicker ticker');
    validate.string(ticker.name, 'addTicker ticker.name');
    validate.number(ticker.mid, 'addTicker ticker.mid');
    validate.number(ticker.low, 'addTicker ticker.low');
    validate.number(ticker.high, 'addTicker ticker.high');
    validate.number(ticker.volume, 'addTicker ticker.volume');
    validate.number(ticker.timestamp, 'addTicker ticker.timestamp');
//    validate.date(ticker.timestamp, 'addTicker ticker.timestamp');
    
    var exchange = await Exchange.findOne({ name: ticker.name });
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

/**
 * Get tickers
 * @returns {array} Tickers array
 */

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
