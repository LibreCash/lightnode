//let common = require('../common');

require('../common');

var 
    settings,
    web3,
    contract;

var status = {
    running: false
}

function init (abiArray, options) {
    settings = options;

    web3 = new Web3(new Web3.providers.HttpProvider(options.infuraUrl));
    contract = new infuraWeb3.eth.Contract(abiArray, options.address);

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
