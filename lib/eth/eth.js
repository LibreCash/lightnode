const 
    fs = require('fs'),
    path = require('path'),
    Web3 = require('web3');

var 
    web3 = null,
    abiArray = null,
    contract = null;

async function init(options, callback) {
    web3 = new Web3(new Web3.providers.WebsocketProvider(options.web3url)),
    abiArray = JSON.parse(fs.readFileSync(options.abiPath)),
    contract = new web3.eth.Contract(abiArray,options.address);

    let  
        mainAccount = await web3.eth.getCoinbase(),
        mainAccBalance = await web3.eth.getBalance(mainAccount),
        lastUpdateTime = await contract.methods.lastUpdateTime().call();
    
    console.log(`eth: Main account ${mainAccount}`);
    console.log(`eth: Main account balance ${mainAccBalance}`);
    console.log(`eth: Last update ${lastUpdateTime}`);

    contract.events.requestUpdate({},(error,event)=>{
        if(error) console.log("!!! ERROR !!!");
        console.log(error);
        console.log(event);
        console.log("eth: requestUpdate()");
        fetching();
    });
}

async function pushToBlockchain(avg) {
    avg = avg * 100;
    console.log(`eth: avarage rate ${avg}`);
    console.log("eth: sendt transaction...");
    mainAccount = await web3.eth.getCoinbase();
    var updateTransaction = await contract.methods.appendData(avg).send({from:mainAccount});
    console.log(updateTransaction);	
    console.log("\r\n");
    console.log(contract.events);
}

module.exports = {
    init: init,
    pushToBlockchain: pushToBlockchain
}
