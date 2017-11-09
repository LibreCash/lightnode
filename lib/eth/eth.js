const 
    fs = require('fs'),
//    config = require('config'),
    Web3 = require('web3');

var settings = {
    web3url: "ws://localhost:8545",
    smartContract: {
        abiPath: __dirname + '/../../bin/OurOracle.abi',
        address: '0x631086e57bbf0fF6FE3Ce02B705DCa076a71072c',
        from: '0x32A3AA73A5eC44CE70ddf0D9372aA52bA793871E'
    }
};

var 
    web3 = new Web3(new Web3.providers.WebsocketProvider(settings.web3url)),
    abiArray = JSON.parse(fs.readFileSync(settings.smartContract.abiPath)),
//    abiArray = JSON.parse(fs.readFileSync(config.get("smartContract.abiPath"))),
    contract = new web3.eth.Contract(abiArray,settings.smartContract.address);
//    contract = new web3.eth.Contract(abiArray,config.get("smartContract.address"));

async function init(callback) {
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
