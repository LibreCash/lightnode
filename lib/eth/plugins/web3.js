const
    Web3 = require('web3');

const config = require('../common').config;

var 
    settings,
    contract;

var status = {
    running: false
}

async function init (abiArray, options) {

    // provider

    var web3Provider = new Web3.providers.WebsocketProvider(options.web3url);
    web3Provider.on('connect', ()=>{
        console.log('web3 plugin provider connected');
        web3Connected = true;
    });
    web3Provider.on('end', ()=>{
        console.log('web3 plugin provider disconnected');
        web3Connected = false;
    });
    web3Provider.on('error', (e)=>{
        console.log('web3 plugin provider error', e);
    });

    // web3

    web3 = new Web3(web3Provider);
    contract = new web3.eth.Contract(abiArray, options.address);

    let
        mainAccount = await web3.eth.getCoinbase(),
        mainAccBalance = await web3.eth.getBalance(mainAccount);

    //this.mail.u();
/*
    logger.info(`eth: Main account ${mainAccount}`);
    logger.info(`eth: Main account balance ${mainAccBalance}`);
*/
    // events

    contract.events.NewOraclizeQuery({},(error,event)=>{
        callback('NewOraclizeQuery', error, event);
    });

    status.running = true;
}

function getStatus () {
    return status;
}

async function pushToBlockchain(avg) {
    var updateTransaction = await contract.methods.__callback(avg).send({
        from: settings.from, 
        gas: settings.gasLimit
    });
//        logger.debug(updateTransaction);	
//        logger.debug("\r\n");
//        logger.debug(contract.events);
}

module.exports = {
    init,
    getStatus,
    pushToBlockchain
}
