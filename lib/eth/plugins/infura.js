const
    Web3 = require('web3');

const config = require('../common').config;

var 
    settings,
    web3,
    contract;

var status = {
    running: false
}

async function init (abiArray, options) {
    settings = options;

    web3 = new Web3(new Web3.providers.HttpProvider(options.infuraUrl));
    contract = new web3.eth.Contract(abiArray, options.address);

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
