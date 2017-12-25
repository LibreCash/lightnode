let common = require('../common');

var status = {
    running: false
}

function init (options) {
    var infuraUrl = options.infuraUrl;
        
    infuraWeb3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));
    infuraWeb3Contract = new infuraWeb3.eth.Contract(abiArray,options.address);
}

function getStatus () {
    return status;
}

module.exports = {
    init,
    getStatus
}
