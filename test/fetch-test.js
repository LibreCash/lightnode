const 
    fs = require('fs'),
    db = require('./lib/db'),
    logger = require('./lib/logger');

logger.info('fetch test');

db.connect('mongodb://localhost/test')

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
            logger.error(`error processing fetcher ${file}`);
            logger.error(error);
            
            return {
                id: file,
                error: error
            };
        }
    }));
    logger.info(result);
    await saveData(result);
}

async function saveData(result) {
    await result.forEach((item)=>{
        if (item instanceof Array) {
            item.forEach((item1)=>{
                db.addTicker(item1);
            })
        }
        else {
            db.addTicker(item);
        }
    })
}

fetching();
