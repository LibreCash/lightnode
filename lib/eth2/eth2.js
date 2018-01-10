const
    web3Client = require('web3-client');

// |online|             1. no web3 connection -> notify error, select another node
// |online|             2. no new blocks
// |checkSenderWallet|  3. sender wallet not present
// |checkSenderWallet|  4. sender wallet is locked
// |checkSenderWallet|  5. sender wallet bad password
// |checkSenderWallet|  6. sender wallet no balance
// |transaction|        7. transaction sending error
// |transaction|        8. send transaction bad result
// |config|             9. bad ABI
// |config|             10. bad smart contract address
// |config|             11. smart contract no address or gas limit

// |deploy|             x1. create wallet if not exists

// |init|               I1. unlock wallet at startup

class Eth {
    constructor () {
        this.clients = [];

        this.initState();
    }

    init (options) {
        clients.push(new web3Client(options.web3, options.address, options.abiArray));
        clients.push(new web3Client(options.infuraUrl, options.address, options.abiArray));
    }

    initState () {
        this.state = {
            activeClient: null,
            errors: []
        }
    }

    getState () {
        return this.state;
    }
}

module.exports = Eth;
