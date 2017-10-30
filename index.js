// bitfinex test [

//bitfinex_test()

function bitfinex_test() {
    var fs = require('fs');
    var wstream0 = fs.createWriteStream('bitfinex.txt')

    const BFX = require('bitfinex-api-node')

    const API_KEY = 'RLVd3ZJRf7gjGuiJcEFe6GWUCnfCz7cnnmxIBTiv2TI'
    const API_SECRET = 'HRRwF1ix82alN9erYIpsE9tMNnxIC0Xgf4Ra2FR1Eg4'

    const opts = {
        version: 2,
        transform: true
    }

    const bws = new BFX(API_KEY, API_SECRET, opts).ws

    function log(...args) {
        wstream0.write(JSON.stringify(args) + '\n')
        console.log(args)
    }

    bws.on('auth', () => {
        // emitted after .auth()
        // needed for private api endpoints

        log('authenticated')
// bws.submitOrder ...
})

    bws.on('open', () => {
        bws.subscribeTicker('BTCUSD')
    bws.subscribeOrderBook('BTCUSD')
    bws.subscribeTrades('BTCUSD')

// authenticate
// bws.auth()
})

    bws.on('orderbook', (pair, book) => {
        log('Order book:', book)
})

    bws.on('trade', (pair, trade) => {
        log('Trade:', trade)
})

    bws.on('ticker', (pair, ticker) => {
        log('Ticker:', ticker)
})

    bws.on('error', console.error)
}

// bitfinex test ]
// polinex test [
/*
var autobahn = require('autobahn');
var wsuri = "ws://api.poloniex.com";
var connection = new autobahn.Connection({
    url: wsuri,
    realm: "realm1"
});

connection.onopen = function (session) {
    function marketEvent (args,kwargs) {
        console.log(args);
    }
    function tickerEvent (args,kwargs) {
        console.log(args);
    }
    function trollboxEvent (args,kwargs) {
        console.log(args);
    }
    session.subscribe('BTC_XMR', marketEvent);
    session.subscribe('ticker', tickerEvent);
    session.subscribe('trollbox', trollboxEvent);
}

connection.onclose = function () {
    console.log("Websocket connection closed");
}

connection.open();
*/
/*
const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex();

poloniex.subscribe('ticker');
poloniex.subscribe('BTC_ETH');

poloniex.on('message', (channelName, data, seq) => {
    if (channelName === 'ticker') {
    console.log(`Ticker: ${data}`);
}

if (channelName === 'BTC_ETC') {
    console.log(`order book and trade updates received for currency pair ${channelName}`);
    console.log(`data sequence number is ${seq}`);
}
});

poloniex.on('open', () => {
    console.log(`Poloniex WebSocket connection open`);
});

poloniex.on('close', (reason, details) => {
    console.log(`Poloniex WebSocket connection disconnected`);
});

poloniex.on('error', (error) => {
    console.log(`An error has occured`);
});

poloniex.openWebSocket();
*/
/*
let headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    'Cookie': 'cf_clearance=25a517254e54524fd5166817cbd6957ec43699fe-1507474839-1800'
}

var fs = require('fs');
var wstream1 = fs.createWriteStream('poloniex.txt')

const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex('7KVC6RZ9-OYMLWGM7-OQDT7801-NJ5IOK6M', 'c4b80bd8fa61b0a60f8e96b05681ecfa1c146026d375d2aa77655bd2beecc6553c7474e06a96114287d3f0180e4d1409225199e050f0b4e809762fdd840c4cbe', { socketTimeout: 15000 });
//({ options.headers: headers })
function log(...args) {
    wstream1.write(JSON.stringify(args) + '\n')
    console.log(args)
}
*/
/*
poloniex.returnLoanOrders('BTC', null, function (err, ticker) {
    if (!err) log(ticker);
});
*/
/*
poloniex.returnTicker().then((ticker) => {
    console.log(ticker);
}).catch((err) => {
    console.log(err.message);
});
*/


/*
poloniex.returnTicker((err, ticker) => {
    if (err) {
        console.log(err.message);
    } else {
        console.log(ticker);
}
});
*/
// polinex test ]

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/test', {
    useMongoClient: true
}).then(() => {
    let
        Exchange = require('./models/Exchange'),
        Coin = require('./models/Coin')

    var exchange = new Exchange({
        name: 'qwerty'
    })

    exchange.save()

    var coin = new Coin({
        exchange: exchange,
        mid: 0.5,
        low: 0.2,
        high: 0.7,
        volume: 1000,
        timestamp: new Date
    })

    coin.save()

    exchange.save()

    Exchange.find({}, (err, exchanges) => {
        console.log(exchanges)
    })

    Coin.find({}, (err, exchanges) => {
        console.log(coins)
    })
})

