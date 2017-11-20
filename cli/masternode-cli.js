const
    minimist = require('minimist'),
    MasterNode = require('../lib/node/masternode');

var usage = process.argv[1] + ' [--config <config>] [--section <section>] [--smartcontract <section>]';

var describe = {
    config: 'config (default: ../config/default.json)',
    section: 'config section (default: masternode0)',
    smartcontract: 'config section smartcontract (default: smartContract)'
};

var options = {
    config: '../config/default.json',
    section: 'masternode0',
    smartcontract: 'smartContract'
};

var argv = minimist(process.argv.slice(2), {});
console.log(argv);

if (argv.config) {
    options.config = argv.config;
}

if (argv.section) {
    options.section = argv.section;
}

if (argv.smartcontract) {
    options.smartcontract = argv.smartcontract;
}

var config = require(options.config);

var optionsMasternode = config[options.section];
optionsMasternode.smartContract = config[options.smartcontract];

(async () => {
    const masterNode = await new MasterNode(optionsMasternode);

    masterNode.on('finished', () => {
        logger.info('master node finish');
    });
    masterNode.on('nodeConnected', () => {
        logger.info('node connected');
    });
    masterNode.on('nodeDisconnected', () => {
        logger.info('node disconnected');
    });

    masterNode.start();
})();
