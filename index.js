const 
    fs = require('fs'),
    config = require('config'),
	Web3 = require('web3');

var 
    web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545")),
    abiArray = JSON.parse(fs.readFileSync(config.get("smartContract.abiPath"))),
    contract = new web3.eth.Contract(abiArray,config.get("smartContract.address"));

async function main() {
    let  
        mainAccount = await web3.eth.getCoinbase(),
        mainAccBalance = await web3.eth.getBalance(mainAccount),
        lastUpdateTime = await contract.methods.lastUpdateTime().call();
        
    console.log(`Основной аккаунт ${mainAccount}`);
    console.log(`Баланс основного аккаунта ${mainAccBalance}`);
    console.log(`Время последнего обновления данных в контракте (до обновления) ${lastUpdateTime}`);

    contract.events.requestUpdate({},(error,event)=>{
        if(error) console.log("!!! ERROR !!!");
        console.log(error);
        console.log(event);
        console.log("Запрошено обновление курса");
        fetching();
    })

}

async function fetching() {
    var fetchersList = fs.readdirSync('./fetchers');
	var result = await Promise.all(fetchersList.map(async (fetcher)=>{
		fetcher = require(`./fetchers/${fetcher}`);
		return await fetcher();
	}));	
	var avg = agregateData(result);
	await pushToBlockchain(avg);
}

function agregateData(data) {
	var sum = 0;
	data.forEach((item)=>{
		sum+=+item.mid;
	}); // rewrite on .reduce
	var result = sum / data.length; 
	console.log(result);
	return result;
}

async function pushToBlockchain(avg){
        avg = avg * 100;
        console.log(`Среднее значение ${avg}`);
        console.log("Отправляем транзакцию в сеть...");
        mainAccount = await web3.eth.getCoinbase();
        var updateTransaction = await contract.methods.appendData(avg).send({from:mainAccount});
        console.log(updateTransaction);	
        console.log("\r\n");
        console.log(contract.events);
}

main();
