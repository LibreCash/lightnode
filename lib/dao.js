const mongoose = require('mongoose');
mongoose.Promise = Promise;

let
    Exchange = require('./../models/Exchange'),
    Coin = require('./../models/Coin');

async function connect(url) {
    await mongoose.connect(url, {
        useMongoClient: true
    })/* .then(() => {

        var exchange = new Exchange({
            name: 'qwerty'
        });

        exchange.save();
    });*/
}

async function addCoin(coin) {
    console.log('addCoin', coin)
    if (!coin || !('name' in coin)) {
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

/*    var coin = new Coin({
        exchange: exchange,
        mid: 0.5,
        low: 0.2,
        high: 0.7,
        volume: 1000,
        timestamp: new Date()
    });*/
/*
name":"poloniex",
		"mid":(+response.highestBid + +response.lowestAsk)/2, // Correct ?
		"low":response.low24hr,
		"high":response.high24hr,
		"volume":response.quoteVolume, // ??? Maybe baseVolume ???
        "timestamp":t
        */
module.exports = {
    connect: connect,
    addCoin: addCoin
}