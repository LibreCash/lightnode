

var 
    settings,
    web3,
    contract;

var status = {
    running: false
}

function init (options) {

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

    // web3

    web3 = new Web3(web3Provider);

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

