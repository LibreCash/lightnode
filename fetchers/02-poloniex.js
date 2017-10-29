const 
	got = require('got');
	
async function fetch(){
	let timestamp = Date.now();
	const URL = 'https://poloniex.com/public?command=returnTicker'
	response = (await got(URL,{json:true})).body;
	response = response.USDT_ETH;
	return {
		"name":"poloniex",
		"mid":(+response.highestBid + +response.lowestAsk)/2, // Correct ?
		"low":response.low24hr,
		"high":response.high24hr,
		"volume":response.quoteVolume, // ??? Maybe baseVolume ???
		"timestamp":timestamp
	};
}

module.exports = fetch;