const 
	got = require('got');
	
async function fetch(){
	const URL = 'https://api.bitfinex.com/v1/pubticker/ethusd'
	response = (await got(URL,{json:true})).body;
	return {
		"name":"bitfinex",
		"mid":parseFloat(response.mid), 
		"low":parseFloat(response.low),
		"high":parseFloat(response.high),
		"volume":parseFloat(response.volume),
		"timestamp":parseFloat(response.timestamp)
	};
}

module.exports = fetch;