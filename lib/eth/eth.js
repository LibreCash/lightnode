const 
    fs = require('fs'),
    path = require('path'),
    logger = require('../logger'),
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
    
    logger.debug(`eth: Main account ${mainAccount}`);
    logger.debug(`eth: Main account balance ${mainAccBalance}`);
    logger.debug(`eth: Last update ${lastUpdateTime}`);

    contract.events.requestUpdate({},(error,event)=>{
        callback('requestUpdate', error, event);
    });
    contract.events.tickerAdded({},(error,event)=>{
        callback('tickerAdded', error, event);
    });
}

async function pushToBlockchain(avg) {
    avg = avg * 100;
    logger.debug(`eth: avarage rate ${avg}`);
    logger.debug("eth: sendt transaction...");
    mainAccount = await web3.eth.getCoinbase();
    var updateTransaction = await contract.methods.appendData(avg).send({from:mainAccount});
    logger.debug(updateTransaction);	
    logger.debug("\r\n");
    logger.debug(contract.events);
}

module.exports = {
    init: init,
    pushToBlockchain: pushToBlockchain
}
