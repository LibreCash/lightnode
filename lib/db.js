const mongoose = require('mongoose');
mongoose.Promise = Promise;

let
    logger = require('./logger'),
    Exchange = require('../models/Exchange'),
    Ticker = require('../models/Ticker'),
    Notification = require('../models/Notification'),
    Node = require('../models/Node');

async function connect(url) {
    console.log('DB', url);
    // bug: https://stackoverflow.com/questions/19474712/mongoose-and-multiple-database-in-single-node-js-project
    var conn = await mongoose.createConnection(url);
    var Exchange = conn.model('Exchange', new mongoose.Schema({
        name: { type: String, required: true, unique: true },
    }));

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

module.exports = {
    connect: connect,
    saveTickets: saveTickets,
    addTicker: addTicker,
    getTickets: getTickets,
    addNotification: addNotification,
    addNode: addNode
}