const 
utils = require('./utils');

var res = utils.processTickersAvarageRate(tickers, {
            avarageRate: this.avarageRate,
            deltaMax: this.tickersDeltaMax
        });

        if (!res.err) {
            this.avarageRate = res.avarageRate;
            
        }