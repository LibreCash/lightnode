const mongoose = require('mongoose');
mongoose.Promise = Promise;

let
    Exchange = require('./../models/Exchange'),
    Coin = require('./../models/Coin');

async function connect(url) {
    await mongoose.connect(url, {
        useMongoClient: true
    })
}

async function addCoin(coin) {
    console.log('addCoin', coin)
    // todo: underscore or check field, etc.
    if (!coin || 
        !('name' in coin) || !coin.name ||
        !('high' in coin) || !coin.high ||
        !('low' in coin) || !coin.low ||
        !('volume' in coin) || !coin.volume) {
        console.log('error addCoin bad param:', coin);
        return
    }
    var exchange = await Exchange.findOne({ name: coin.name })
    if (!exchange) {
        exchange = new Exchange({
            name: coin.name
        });
        await exchange.save();
    }
    coin.exchange = exchange;
    coin = new Coin(coin);
    await coin.save();
}

module.exports = {
    connect: connect,
    addCoin: addCoin
}