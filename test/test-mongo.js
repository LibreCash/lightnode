const mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/test').then(() => {
    let
        Exchange = require('./models/Exchange'),
        Coin = require('./models/Coin');

    var exchange = new Exchange({
        name: 'qwerty'
    });

    exchange.save();

    var coin = new Coin({
        exchange: exchange,
        mid: 0.5,
        low: 0.2,
        high: 0.7,
        volume: 1000,
        timestamp: new Date()
    });

    coin.save();

    exchange.save();

    Exchange.find({}, (err, exchanges) => {
        console.log(exchanges);
    });

    Coin.find({}, (err, coins) => {
        console.log(coins);
    });
});
