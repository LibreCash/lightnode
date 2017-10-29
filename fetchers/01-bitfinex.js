const 
	got = require('got');
	fs = require('fs');
	
async function fetch(){
	const URL = 'https://api.bitfinex.com/v1/pubticker/ethusd'
	response = await got(URL,{json:true}).body;
	return {
		"mid":response.mid, 
		"low":response.low,
		"high":response.high,
		"volume":response.volume,
		"timestamp":response.timestamp
	};
}

module.export = fetch;