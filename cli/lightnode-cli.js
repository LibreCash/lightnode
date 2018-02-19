const
    minimist = require('minimist'),
    LightNode = require('../core/lib/node/lightnode');

var usage = process.argv[1] + ' [--config <config>] [--section <section>] [--smartcontract <section>]';

var describe = {
    config: 'config (default: ../config/default.json)',
    section: 'config section (default: lightnode0)',
    smartcontract: 'config section smartcontract (default: smartContract)'
};

var options = {
    config: '../config/default.json',
    section: 'lightnode0',
    smartcontract: 'smartContract'
};

var argv = minimist(process.argv.slice(2), {});

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

var config = require(options.config);

console.log('lightnode-cli: using section:', options.section);

var optionsLightnode = config[options.section];
optionsLightnode.smartContract = config[options.smartcontract];

const lightNode = new LightNode(optionsLightnode.id);

lightNode.start(optionsLightnode);
