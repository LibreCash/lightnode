const
    EventEmitter = require('events'),
    logger = require('../logger'),
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

class Eth extends EventEmitter {
    constructor () {
        this.clients = [];

        this.initState();
    }

    /**
     * Init
     * @param {EthOptions} options Eth options
     */

    init (options) {
        try {
            let abiArray = this.loadAbi(options.abi);
            if (!abiArray)
                return;

            this.connect(options.web3, options.address, abiArray);
            this.connect(options.infuraUrl, options.address, abiArray);
        }
        catch (e) {
            this.notifyError('ETH_INIT_ERROR', e);
        }
    }

    /**
     * Init state
     */

    initState () {
        this.state = {
            activeClient: null,
            errors: []
        }
    }

    /**
     * Return state
     * @returns {EthState} Eth state
     */

    getState () {
        return this.state;
    }

    /**
     * Connect
     * @param {String} url Web3 url
     * @param {String} address Contract address
     * @param {*} abiArray ABI array
     */

    connect (url, address, abiArray) {
        const options = {
            url,
            address,
            abiArray
        }
        const client = new web3Client(options);
        client.on('event', this.onClientEvent);

        this.clients.push(client);
    }

    /**
     * Callback from web3 client
     * @param {*} info
     */

    onClientEvent (...info) {
        var code = info[0];
        if (code == 'WEB3CLIENT_CONNECTED') {
        }
        else if (code == 'WEB3CLIENT_DISCONNECTED') {
            this.notifyError(...info);
        }
        else if (code == 'WEB3CLIENT_ERROR') {
            this.notifyError(...info);
        }
    }

    // check wallet

    checkSenderWallet () {

    }

    /**
     * Load abi from path
     * @param {String} abi ABI path
     * @returns {AbiArray} ABI array
     */

    loadAbi (abiPath) {
        try {
            let abiArrayPath = path.resolve(abiPath);
            let abiArray = JSON.parse(fs.readFileSync(abiArrayPath));
            return abiArray;
        }
        catch (e) {
            notifyError('ETH_ERROR_READ_ABI', e);
            return null;
        }
    }

    /**
     * Notify error
     * @param {*} err Error
     */

    notifyError (...err) {
        logger.error(...err);
        this.emit('error', ...err);
    }
}

module.exports = Eth;
