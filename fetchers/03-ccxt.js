const 
    ccxt = require('ccxt'),
    logger = require('../lib/logger');
    
items = [];
async function add(ctx, ticker) {
    try {
        logger.debug('ccxt fetch ticket', ctx.name, ticker);

        markets = await ctx.loadMarkets();
        logger.debug(ctx.name, markets)

        if (!(ticker in markets)) {
            logger.error('NOSYM', ctx.name, ticker);
            return;
        }

        ticker = await ctx.fetchTicker(ticker);
        logger.debug(ticker);

        item = {
            name: ctx.name,
            mid: ticker.last,
            low: ticker.low,
            high: ticker.high,
            volume: ticker.baseVolume,
            timestamp: ticker.timestamp
        };

        items.push(item);

        return item
    }
    catch (error) {
        logger.error(`error ${ctx.name}`, error);
        return error
    }
}

function defaultExchanges() {
    var defaultTimeout = 5;
    return [
        {exchange: new ccxt.kraken(), reconnectTimeout: defaultTimeout},
//        {exchange: new ccxt.bitfinex(), reconnectTimeout: defaultTimeout},
//        {exchange: new ccxt.bitfinex2(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.bitflyer(), reconnectTimeout: defaultTimeout},
/*        {exchange: new ccxt.bitbay(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.bitlish(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.bitstamp(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.coinmarketcap(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.dsx(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.exmo(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.gatecoin(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.gdax(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.gemini(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.hitbtc(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.hitbtc2(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.livecoin(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.mixcoins(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.okcoinusd(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.quoine(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.southxchange(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.yobit(), reconnectTimeout: defaultTimeout},
        {exchange: new ccxt.wex(), reconnectTimeout: defaultTimeout}*/
    ];
}

async function processExchanges(exchanges) {
    logger.debug(exchanges);
    await Promise.all(exchanges.map(async (item)=>{
        var result = await add(item.exchange, 'ETH/USD');
        logger.debug('exchange add', result)
        return result
    }));
}

async function fetch() {
    items = [];

    await processExchanges(defaultExchanges());
    logger.debug('cctx result:', items);

    return items;
}

module.exports = fetch
