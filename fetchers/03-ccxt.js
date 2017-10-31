const 
    ccxt = require('ccxt');
    
items = [];
async function add(ctx, ticker) {
    try {
        console.log('ccxt fetch ticket', ctx.name, ticker);
        markets = await ctx.loadMarkets();
//        console.log(ctx.name, markets)
        if (!(ticker in markets)) {
            console.log('NOSYM', ctx.name, ticker);
            return;
        }
        ticker = await ctx.fetchTicker(ticker);
//        console.log(ticker);
        coin = {
            name: ctx.name,
            mid: ticker.last,
            low: ticker.low,
            high: ticker.high,
            volume: ticker.baseVolume,
            timestamp: ticker.timestamp
        };

        items.push(coin);
    }
    catch (error) {
        console.log(`error ${ctx.name}`, error);
    }
}

async function fetch() {
    items = [];

    console.log("ccxt.exchanges", ccxt.exchanges);

    await add(new ccxt.kraken(), 'ETH/USD');
    await add(new ccxt.bitfinex(), 'ETH/USD');
    await add(new ccxt.bitfinex2(), 'ETH/USD');
    await add(new ccxt.bitflyer(), 'ETH/USD'); //ddos
    await add(new ccxt.bitbay(), 'ETH/USD');
    await add(new ccxt.bitlish(), 'ETH/USD');
    await add(new ccxt.bitstamp(), 'ETH/USD');
    await add(new ccxt.coinmarketcap(), 'ETH/USD');
    await add(new ccxt.dsx(), 'ETH/USD');
    await add(new ccxt.exmo(), 'ETH/USD');
    await add(new ccxt.gatecoin(), 'ETH/USD');
    await add(new ccxt.gdax(), 'ETH/USD');
    await add(new ccxt.gemini(), 'ETH/USD');
    await add(new ccxt.hitbtc(), 'ETH/USD');
    await add(new ccxt.hitbtc2(), 'ETH/USD');
    await add(new ccxt.livecoin(), 'ETH/USD');
    await add(new ccxt.mixcoins(), 'ETH/USD');
    await add(new ccxt.okcoinusd(), 'ETH/USD');
    await add(new ccxt.quoine(), 'ETH/USD');
    await add(new ccxt.southxchange(), 'ETH/USD');
    await add(new ccxt.yobit(), 'ETH/USD');
    await add(new ccxt.wex(), 'ETH/USD');

//    await add(new ccxt.bithumb(), 'ETH/USD'); //nosym,ddos
//    await add(new ccxt.huobi(), 'BTC/USD'); //nosym
//    await add(new ccxt._1broker(), 'BTC/USD'); //key
//    await add(new ccxt._1btcxe(), 'BTC/USD'); //!ddos
//    await add(new ccxt.acx(), 'BTC/USD'); //nosym
//    await add(new ccxt.allcoin(), 'ETH/USD'); //nosym
//    await add(new ccxt.anxpro(), 'ETH/USD'); //nosym
//    await add(new ccxt.binance(), 'ETH/USD'); //nosym
//    await add(new ccxt.bit2c(), 'ETH/USD'); //nosym
//    await add(new ccxt.bitcoincoid(), 'ETH/USD'); //nosym

    //    await add(new ccxt.bitmarket(), 'ETH/USD'); //nosym
//    await add(new ccxt.bitmex(), 'ETH/USD'); //nosym
//    await add(new ccxt.bitso(), 'ETH/USD'); //nosym
//    await add(new ccxt.bitstamp1(), 'ETH/USD'); //v1-nofn
//    await add(new ccxt.bittrex(), 'ETH/USD');
//    await add(new ccxt.bl3p(), 'ETH/USD');
//    await add(new ccxt.bleutrade(), 'ETH/USD');
//    await add(new ccxt.btcbox(), 'ETH/USD');
//    await add(new ccxt.btcchina(), 'ETH/USD');
//    await add(new ccxt.btcexchange(), 'ETH/USD');
//    await add(new ccxt.btcmarkets(), 'ETH/USD');
//    await add(new ccxt.btctradeua(), 'ETH/USD');
//    await add(new ccxt.btcturk(), 'ETH/USD');
//    await add(new ccxt.btcx(), 'ETH/USD');
//    await add(new ccxt.bter(), 'ETH/USD');
//    await add(new ccxt.bxinth(), 'ETH/USD');
//    await add(new ccxt.ccex(), 'ETH/USD'); ddos
//    await add(new ccxt.cex(), 'ETH/USD');  timeout
//    await add(new ccxt.chbtc(), 'ETH/USD');
//    await add(new ccxt.chilebit(), 'ETH/USD');
//    await add(new ccxt.coincheck(), 'ETH/USD');
//    await add(new ccxt.coinfloor(), 'ETH/USD');
//    await add(new ccxt.coingi(), 'ETH/USD');
//    await add(new ccxt.coinmate(), 'ETH/USD');
//    await add(new ccxt.coinsecure(), 'ETH/USD');
//    await add(new ccxt.coinspot(), 'ETH/USD');
//    await add(new ccxt.cryptopia(), 'ETH/USD');
//    await add(new ccxt.flowbtc(), 'ETH/USD'); timeout
//    await add(new ccxt.foxbit(), 'ETH/USD');
//    await add(new ccxt.fybse(), 'ETH/USD');
//    await add(new ccxt.fybsg(), 'ETH/USD');
//    await add(new ccxt.gateio(), 'ETH/USD');
//    await add(new ccxt.huobi(), 'ETH/USD');
//    await add(new ccxt.huobicny(), 'ETH/USD');
//    await add(new ccxt.huobipro(), 'ETH/USD');
//    await add(new ccxt.independentreserve(), 'ETH/USD'); ddos
//    await add(new ccxt.itbit(), 'ETH/USD');
//    await add(new ccxt.jubi(), 'ETH/USD'); error 405
//    await add(new ccxt.kuna(), 'ETH/USD');
//    await add(new ccxt.lakebtc(), 'ETH/USD');
//    await add(new ccxt.liqui(), 'ETH/USD');
//    await add(new ccxt.luno(), 'ETH/USD');
//    await add(new ccxt.mercado(), 'ETH/USD');
//    await add(new ccxt.nova(), 'ETH/USD');
//    await add(new ccxt.okcoincny(), 'ETH/USD');
//    await add(new ccxt.okex(), 'ETH/USD');
//    await add(new ccxt.paymium(), 'ETH/USD');
//    await add(new ccxt.poloniex(), 'ETH/USD'); notavailable
//    await add(new ccxt.quadrigacx(), 'ETH/USD');
//    await add(new ccxt.qryptos(), 'ETH/USD');
//    await add(new ccxt.surbitcoin(), 'ETH/USD');
//    await add(new ccxt.tidex(), 'ETH/USD');
//    await add(new ccxt.therock(), 'ETH/USD');
//    await add(new ccxt.urdubit(), 'ETH/USD');
//    await add(new ccxt.vaultoro(), 'ETH/USD');
//    await add(new ccxt.vbtc(), 'ETH/USD');
//    await add(new ccxt.virwox(), 'ETH/USD');
//    await add(new ccxt.xbtce(), 'ETH/USD');
//    await add(new ccxt.yunbi(), 'ETH/USD'); notavailable
//    await add(new ccxt.zaif(), 'ETH/USD');

    console.log(items);

    return items;
}

module.exports = fetch;
