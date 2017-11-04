const 
    fs = require('fs'),
    logger = require('../logger');

async function fetch() {
    console.log(__dirname);
    var fetchersList = fs.readdirSync(__dirname+'/../../fetchers');
	var result = await Promise.all(fetchersList.map(async (file)=>{
        try {
            console.log(`fetch ${file}`);
            //non-test
            //fetcher = require(`./fetchers/${file}`);
            fetcher = require(__dirname+`/../../fetchers/${file}`);

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
    return result;
}

module.exports = {
    fetch: fetch
}
