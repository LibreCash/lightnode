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

var settings;

async function init(options, callback) {
    settings = options;

//    var infuraUrl = 'https://mainnet.infura.io/E4jEQrMLKM1gTCwHUKFr';
    var infuraUrl = 'https://rinkeby.infura.io/E4jEQrMLKM1gTCwHUKFr';
    
    infuraWeb3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));

    var web3Provider = new Web3.providers.WebsocketProvider(options.web3url);
//    var web3Provider = new Web3.providers.HttpProvider(options.web3url); // no events with http !!!
    web3Provider.on('end', ()=>{
        console.log('provider disconnected');
    });


    web3 = new Web3(web3Provider);
    abiArray = JSON.parse(fs.readFileSync(path.resolve(options.abiPath)));
    contract = new web3.eth.Contract(abiArray,options.address);

    let  
        mainAccount = await web3.eth.getCoinbase(),
        mainAccBalance = await web3.eth.getBalance(mainAccount);

    contract.events.BankSet({},(error,event)=>{
        callback('BankSet', error, event);
    });

    contract.events.NewOraclizeQuery({},(error,event)=>{
        callback('NewOraclizeQuery', error, event);
    });

    contract.events.NewPriceTicker({},(error,event)=>{
        callback('NewPricePicker', error, event);
    });

    contract.events.OwnershipTransferred({},(error,event)=>{
        callback('OwnershipTransferred', error, event);
    });

    contract.events.UpdaterAddressSet({},(error,event)=>{
        callback('UpdaterAddressSet', error, event);
    });


/*    var res = await contract.methods.setUpdaterAddress(options.from).send({
        from: options.from, 
        gas: 47000
    });
    var res = await contract.methods.setBank(options.from).send({
        from: options.from, 
        gas: 47000
    });
    var res = await contract.methods.updateRate().send({
        from: options.from, 
        gas: 47000
    });
  */  

//    console.log("eth.pendingTransactions", eth.pendingTransactions);
//    console.log("pending", eth.getBlock("pending", true).transactions());
    
//    tx = eth.pendingTransactions[1]
//    eth.resend(tx, newGasPrice, newGasLimit)
    
    
    logger.debug(`eth: Main account ${mainAccount}`);
    logger.debug(`eth: Main account balance ${mainAccBalance}`);
}

async function pushToBlockchain(avg) {
    avg = avg * 100;
    logger.debug(`eth: avarage rate ${avg}`);
    logger.debug("eth: sendt transaction...");
    mainAccount = await web3.eth.getCoinbase();
//    var updateTransaction = await contract.methods.appendData(avg).send({from:mainAccount});

    var updateTransaction = await contract.methods.__callback(avg).send({
        from: settings.from, 
        gas: 147000
    });

    logger.debug(updateTransaction);	
    logger.debug("\r\n");
    logger.debug(contract.events);
}

module.exports = {
    init: init,
    pushToBlockchain: pushToBlockchain
}
