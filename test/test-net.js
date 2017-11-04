const 
    client = require('../lib/net/client'),
    server = require('../lib/net/server'),
    LightNode = require('../lib/node/lightnode'),
    MasterNode = require('../lib/node/masternode');

var options = require('../lib/net/config.js');

async function run() {
    server.start(options, async ()=>{
        await client.connect(options);
        console.log('aaa');
        
        var clientState = await client.getClientState();
        console.log('clientState', clientState);
        
        var nodeState = await client.getNodeState();
        console.log('nodeState', nodeState);
        
        var rates = await client.getRates();
        console.log('rates', rates);
        
        var notifications = await client.getNotifications();
        console.log('notifications', notifications);
    });
}

//run();


const lightNode = new LightNode();

lightNode.start(options);

const masterNode = new MasterNode();

masterNode.on('finished', () => {
    logger.info('master node finish');
});
masterNode.on('nodeConnected', () => {
    logger.info('node connected');
});
masterNode.on('nodeDisconnected', () => {
    logger.info('node disconnected');
});

masterNode.addNode(options);
