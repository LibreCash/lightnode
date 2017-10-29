const 
    fs = require('fs'),
    config = require('config'),
	async = require('async'),
    got = require('got');

async function main(){
    var fetchersList = fs.readdirSync('./fetchers');
	/*console.log(fetchersList);*/

	var result = await Promise.all(fetchersList.map(async (fetcher)=>{
		fetcher = require(`./fetchers/${fetcher}`);
		return await fetcher();
	}));	
	console.log(result);
}

main();
