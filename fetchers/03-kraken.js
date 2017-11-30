const 
got = require('got');

// todo: verify fields in ccxt

var name = 'kraken'

async function fetch(){
//    const URL = 'https://api.kraken.com/0/public/AssetPairs'
    const URL = 'https://api.kraken.com/0/public/OHLC?pair=ethusd'
//    const URL = 'https://api.kraken.com/0/public/Ticker?pair=ethusd'
    var response = (await got(URL,{json:true})).body;
    if (response.error && (response.error.constructor === Array && response.error.length > 0) ) {
        throw response.error;
    }
    var asset = response.result['XETHZUSD'];
    var last = parseFloat(response.result.last);

    // Note: the last entry in the OHLC array is for the current, not-yet-committed frame and will always be present, regardless of the value of "since".

    var a;
    for (var i = asset.length - 1; i > 0; i--) {
        var b = asset[i];
        var timestamp = parseFloat(b[0]);
        if (last == timestamp) {
            a = b;
            break;
        }
    }

    if (a == undefined)
        throw name + ": can't find last asset";

    var low = parseFloat(a[3]);
    var high = parseFloat(a[2]);
    var mid = high + (high - low) / 2.;
    var volume = parseFloat(a[6]);
    var timestamp = parseFloat(a[0]);

    return {
        "name": name,
        "mid": mid, 
        "low": low,
        "high": high,
        "volume": volume,
        "timestamp": timestamp
    };
}

module.exports = fetch;