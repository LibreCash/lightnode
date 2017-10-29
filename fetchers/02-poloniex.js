const 
	got = require('got');
	fs = require('fs');
	
async function fetch(){
	var timestamp = Date.now();
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
fetch().then(console.log);

module.export = fetch;