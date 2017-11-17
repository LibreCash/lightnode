const 
    client0 = require('../lib/net/client'),
    client1 = require('../lib/net/client'),
    server = require('../lib/net/server'),
    LightNode = require('../lib/node/lightnode'),
    MasterNode = require('../lib/node/masternode');

var options = require('../config/default.json');
    
var optionsLightnode0 = options.lightnode0;
var optionsLightnode1 = options.lightnode1;
var optionsMasternode0 = options.masternode0;
optionsMasternode0.smartContract = options.smartContract;

/* single instance test
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
run();
*/

const lightNode0 = new LightNode(1);

//lightNode0.start(optionsLightnode0);


const lightNode1 = new LightNode(2);

//lightNode1.start(optionsLightnode1);


(async () => {
    const masterNode = await new MasterNode(optionsMasternode0);

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