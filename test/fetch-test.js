console.log('fetch test');

var fs = require('fs');
var dao = require('./lib/dao');

dao.connect('mongodb://localhost/test')

async function fetching() {
    var fetchersList = fs.readdirSync('./fetchers');
	var result = await Promise.all(fetchersList.map(async (file)=>{
        try {
            console.log(`fetch ${file}`);
            //non-test
            fetcher = require(`./fetchers/${file}`);
            //fetcher = require(`./../fetchers/${file}`);

            var data = await fetcher();
            data.id = file;
            return data;
        }
        catch (error) {
            console.log(`error processing fetcher ${file}`);
            console.log(error);
            
            return {
                id: file,
                error: error
            };
        }
    }));
    console.log(result);
    await saveData(result);
//	var avg = agregateData(result);
//	await pushToBlockchain(avg);
}

async function saveData(result) {
    await result.forEach((item)=>{
        if (item instanceof Array) {
            item.forEach((item1)=>{
                dao.addCoin(item1);
            })
        }
        else {
            dao.addCoin(item);
        }
    })
}

fetching();
