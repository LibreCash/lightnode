const 
    fs = require('fs'),
    path = require('path'),
    logger = require('../logger'),
    Web3 = require('web3');

var 
    web3 = null,
    abiArray = null,
    contract = null;

var infuraWeb3;

//var ethereumNetwork = 'Rinkeby'; // Main, Ropsten, Rinkeby, Kovan, INFURAnet
var ethereumConnection = 'local'; // local, infura

var settings;
var web3Connected = false;

async function init(options, callback) {
    settings = options;

    var infuraUrl = options.infuraUrl;
    
    infuraWeb3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));
    infuraWeb3Contract = new infuraWeb3.eth.Contract(abiArray,options.address);

    // provider

    var web3Provider = new Web3.providers.WebsocketProvider(options.web3url);
    web3Provider.on('connect', ()=>{
        console.log('provider connected');
        web3Connected = true;
    });
    web3Provider.on('end', ()=>{
        console.log('provider disconnected');
        web3Connected = false;
    });
    web3Provider.on('error', ()=>{
        console.log('provider error');
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

    logger.debug(`eth: Main account ${mainAccount}`);
    logger.debug(`eth: Main account balance ${mainAccBalance}`);
}

async function pushToBlockchain(avg) {
    avg = avg * 100;
    logger.debug(`eth: avarage rate ${avg}`);
    logger.debug("eth: sendt transaction...");
    mainAccount = await web3.eth.getCoinbase();

    var updateTransaction = await contract.methods.__callback(avg).send({
        from: settings.from, 
        gas: settings.gasLimit
    });

    logger.debug(updateTransaction);	
    logger.debug("\r\n");
    logger.debug(contract.events);
}

module.exports = {
    init: init,
    pushToBlockchain: pushToBlockchain
}
