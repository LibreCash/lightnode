/**
 * Process tickers avarage rate
 * @param {Array} tickers 
 * @param {*} options {avarageRate, deltaMax}
 * @returns {*} {err, avarageRate}
 */

function processTickersAvarageRate(tickers, options) {
    var fails = null;
//    var count = tickers.length;
    var avarageRate = 0;
    
    tickers.forEach((ticker)=>{
        console.log(ticker);
    })
    for (var j = 0; j < count; j++) {
//        var ticker = tickers[node.lastTickerIndex++];
        var mid = ticker.mid;

        // verify node
        var delta = mid - options.avarageRate;
        if (options.avarageRate == 0)
            delta = 0;
        var deltaMax = options.avarageRate * options.deltaMax;
        if (Math.abs(delta) > deltaMax) {
            fails = (fails || []).push(ticker);
        }
        else {
            avarageRate += mid;
        }
    }

    avarageRate /= count;

    return {
        err: fails,
        avarageRate,
    }
}

/**
 * Process light nodes final avarage rate
 * @param {Array} nodes processed nodes array
 * @returns {Number} final avarage rate
 */

function processNodesFinalAvarageRate(nodes) {
    var finalAvarageRate = 0;
    for (var i in nodes) {
        var node = nodes[i];
        finalAvarageRate += node.avarageRate;
    }

    finalAvarageRate /= processedNodes.length;

    return finalAvarageRate;
}

module.exports = {
    processTickersAvarageRate
}
