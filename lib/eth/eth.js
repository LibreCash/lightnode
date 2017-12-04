const 
    fs = require('fs'),
    path = require('path'),
    logger = require('../logger'),
    Web3 = require('web3');

var 
    web3 = null,
    abiArray = null,
    contract = null;

/*
Main Ethereum Network
https://mainnet.infura.io/E4jEQrMLKM1gTCwHUKFr 
Test Ethereum Network (Ropsten)
https://ropsten.infura.io/E4jEQrMLKM1gTCwHUKFr 
Test Ethereum Network (Rinkeby)
https://rinkeby.infura.io/E4jEQrMLKM1gTCwHUKFr 
Test Ethereum Network (Kovan)
https://kovan.infura.io/E4jEQrMLKM1gTCwHUKFr 
Test Ethereum Network (INFURAnet)
https://infuranet.infura.io/E4jEQrMLKM1gTCwHUKFr 
*/

var infuraWeb3;

var ethereumNetwork = 'Main'; // Main, Ropsten, Rinkeby, Kovan, INFURAnet
var ethereumConnection = 'local'; // local, infura

async function init(options, callback) {
//    var infuraUrl = 'https://mainnet.infura.io/E4jEQrMLKM1gTCwHUKFr';
    var infuraUrl = 'https://rinkeby.infura.io/E4jEQrMLKM1gTCwHUKFr';
    
    infuraWeb3 = new Web3(new Web3.providers.WebsocketProvider(infuraUrl));

    var web3Provider = new Web3.providers.WebsocketProvider(options.web3url);
    web3Provider.on('end', ()=>{
        console.log('provider disconnected');
    });

    web3 = new Web3(web3Provider);
    abiArray = JSON.parse(fs.readFileSync(options.abiPath));
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
