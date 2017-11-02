const mongoose = require('mongoose');
mongoose.Promise = Promise;

let
    logger = require('./logger'),
    Exchange = require('../models/Exchange'),
    Ticker = require('../models/Ticker');

async function connect(url) {
    await mongoose.connect(url, {
        useMongoClient: true
    })
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

module.exports = {
    connect: connect,
    addCoin: addTicker
}