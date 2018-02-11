const mongoose = require('mongoose');
mongoose.Promise = Promise;

const
    passportLocalMongoose = require('passport-local-mongoose'),
    logger = require('./logger'),
    validate = require('./validate');
    
var 
    Exchange,
    Ticker,
    Notification,
    NetNode,
    LightNodeState,
    MasterNodeState;

function initModels(conn) {
    Exchange = require('../models/Exchange').createModel(conn);
    Ticker = require('../models/Ticker').createModel(conn);
    Notification = require('../models/Notification').createModel(conn);
    NetNode = require('../models/NetNode').createModel(conn);
    LightNodeState = require('../models/LightNodeState').createModel(conn);
    MasterNodeState = require('../models/MasterNodeState').createModel(conn);
    Action = require('../models/Action').createModel(conn);
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
 * Save tickers
 * @param {array} tickers Tickers array
 */

async function saveTickers(tickers) {
    await tickers.forEach(async (item)=>{
        await this.addTicker(item);
    });
}

/**
 * Add ticker to db
 * @param {Ticker} ticker Ticker object
 */

async function addTicker(ticker) {

    validate.object(ticker, 'addTicker ticker');
    validate.string(ticker.name, 'addTicker ticker.name');
    validate.number(ticker.lastest, 'addTicker ticker.lastest');
    validate.string(ticker.updateTime, 'addTicker ticker.updateTime');
    validate.string(ticker.timestamp, 'addTicker ticker.timestamp');
    
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

/**
 * Add action
 * @param {Action} action Action
 */

async function addAction(action) {
    try {
        var action = new Action(action);

        await action.save();
    }
    catch (e) {
        logger.error('db.addAction error', e);
    }
}

/**
 * Get actions
 * @param {ActionsFilter} filter Actions filter
 * @returns {Array} Actions
 */

async function getActions(filter) {
    var actions = await Action.find();
    return actions;
}

module.exports = {
    connect,
    saveTickers,
    addTicker,
    getTickers,
    addNotification,
    addNetNode,
    getNetNodes,
    updateLightNodeState,
    updateMasterNodeState,
    addAction,
    getActions
}
