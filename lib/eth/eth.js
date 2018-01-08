const 
    Manager = require('./manager');

const manager = new Manager();

async function init(options, callback) {
    await manager.init(options, callback);
}

async function pushToBlockchain(avg) {
    manager.pushToBlockchain(avg);
}

function getStatus() {
    return manager.getStatus();
}

module.exports = {
    init,
    pushToBlockchain,
    getStatus 
}
