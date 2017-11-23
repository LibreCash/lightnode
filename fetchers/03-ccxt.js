const 
    ccxt = require('ccxt'),
    logger = require('../lib/logger');
    
async function add(ctx, ticker) {
    try {
        logger.debug('ccxt fetch ticker', ctx.name, ticker);

        markets = await ctx.loadMarkets();
//        logger.debug(`markets ${ctx.name}`, markets);

        if (!(ticker in markets)) {
            throw new Error(`NOSYM ${ticker}`);
        }

        ticker = await ctx.fetchTicker(ticker);
//        logger.debug(ticker);

        var item = {
            name: ctx.name,
            mid: ticker.last,
            low: ticker.low,
            high: ticker.high,
            volume: ticker.baseVolume || ticker.quoteVolume,
            timestamp: ticker.timestamp
        };

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
        {exchange: new ccxt.bitbay(), reconnectTimeout: defaultTimeout},
/*        {exchange: new ccxt.bitflyer(), reconnectTimeout: defaultTimeout},
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
    logger.debug('process exchanges:', exchanges);
    var items = await Promise.all(exchanges.map(async (item)=>{
        var result = await add(item.exchange, 'ETH/USD');
        logger.debug(`exchange add ${JSON.stringify(result)}`);
        return result;
    }));
    return items;
}

async function fetch() {
    var items = await processExchanges(defaultExchanges());
//    logger.debug('cctx result:', items);
    return items;
}

module.exports = fetch
