const
    minimist = require('minimist'),
    LightNode = require('../lib/node/lightnode');

var usage = process.argv[1] + ' [--config <config>] [--section <section>]';

var describe = {
    'config': 'config (default: ../config/default.json)',
    'section': 'config section (default: lightnode0)'
};

var options = {
    config: '../config/default.json',
    section: 'lightnode0'
};

var argv = minimist(process.argv.slice(2), {});

if (argv.config) {
    options.config = argv.config;
}

if (argv.section) {
    options.section = argv.section;
}

var config = require(options.config);

console.log('lightnode-cli: using section:', options.section);

var optionsLightnode = config[options.section];

const lightNode = new LightNode(optionsLightnode.id);

lightNode.start(optionsLightnode);
