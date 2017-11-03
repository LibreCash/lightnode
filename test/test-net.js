const 
    client = require('../lib/net/client'),
    server = require('../lib/net/server');

var options = require('../lib/net/config.js');

server.start(options);

client.connect(options);

var clientState = client.getClientState();
console.log(clientState);

var nodeState = client.getNodeState();
console.log(nodeState);

var rates = client.getRates();
console.log(rates);

var notifications = client.getNotifications();
console.log(notifications);
