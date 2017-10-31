console.log('fetch test')

fs = require('fs')

async function fetching() {
    var fetchersList = fs.readdirSync('./fetchers');
	var result = await Promise.all(fetchersList.map(async (file)=>{
        try {
            console.log(`fetch ${file}`)
            fetcher = require(`./fetchers/${file}`);
            
            var data = await fetcher();
            data.id = file
            return data
        }
        catch (error) {
            console.log(`error processing fetcher ${file}`)
            console.log(error)
            
            return {
                id: file,
                error: error
            }
        }
    }));
    console.log(result)
	var avg = agregateData(result);
//	await pushToBlockchain(avg);
}

fetching()
