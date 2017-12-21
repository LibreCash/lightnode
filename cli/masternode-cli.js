const
    minimist = require('minimist'),
    MasterNode = require('../lib/node/masternode');

var usage = process.argv[1] + ' [--config <config>] [--section <section>]';

var describe = {
    config: 'config (default: ../config/default.json)',
    section: 'config section (default: masternode0)'
};

var options = {
    config: '../config/default.json',
    section: 'masternode0'
};

var argv = minimist(process.argv.slice(2), {});
//console.log(argv);

if (argv.help) {
    console.log(usage);
    Object.keys(describe).forEach(function (p) {
        console.log('  --'+p+' -', describe[p]);
    });
    return;
}

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
