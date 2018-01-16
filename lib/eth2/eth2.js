const
    EventEmitter = require('events'),
    path = require('path'),
    fs = require('fs'),
    logger = require('../logger'),
    Web3Client = require('./web3-client');

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
        super();

        this.clients = [];
        this.clientsMap = {};

        this.initState();
    }

    /**
     * Init
     * @param {EthOptions} options Eth options
     */

    init (options) {
        this.options = options;
        try {
            let abiArray = this.loadAbi(options.abiPath);
            if (!abiArray)
                return;

            this.connect('web3', options.web3url, options.address, abiArray);
            this.connect('infura', options.infuraUrl, options.address, abiArray);
            this.state.activeClient = 'infura';
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
            clients: [],
            errors: [],
            lastPrice: 0,
            lastUpdate: null
        }
    }

    /**
     * Return state
     * @returns {EthState} Eth state
     */

    getState () {
        // todo: review
        this.state.clients = [];
        for (var name in this.clientsMap) {
            var client = this.clientsMap[name];

            var clientState = {};

            clientState.name = name;
            clientState.url = client.url;
            clientState.connected = client.web3Connected;
            clientState.active = clientState.activeClient == name;
            clientState.lastPrice = this.state.lastPrice;
            clientState.lastUpdate = this.state.lastUpdate;
    
            this.state.clients.push(clientState);
        }

        return this.state;
    }

    /**
     * Connect
     * @param {String} url Web3 url
     * @param {String} address Contract address
     * @param {*} abiArray ABI array
     */

    async connect (name, url, address, abiArray) {
        const options = {
            url,
            address,
            abiArray
        }
        const client = new Web3Client(name);
        client.on('event', this.onClientEvent.bind(this));
        await client.init(options);

        this.clients.push(client);
        this.clientsMap[name] = client;
    }

    /**
     * Callback from web3 client
     * @param {*} info
     */

    onClientEvent (...info) {
        var name = info[0];
        var code = info[1];
        if (code == 'WEB3CLIENT_CONNECTED') {
            this.state.activeClient = name;
        }
        else if (code == 'WEB3CLIENT_DISCONNECTED') {
            this.state.activeClient = 'infura';
            this.notifyError(...info);
        }
        else if (code == 'WEB3CLIENT_ERROR') {
            this.notifyError(...info);
        }
        else {
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
            this.notifyError('ETH_ERROR_READ_ABI', e);
            return null;
        }
    }

    /**
     * Push to blockchain
     */

    pushToBlockchain (avg) {
        this.clientsMap[this.activeClient].contractPushToBlockchain(avg, {
            from: this.options.from,
            gasLimit: this.options.gasLimit
        });

        this.state.lastPrice = avg;
        this.state.lastUpdate = new Date().toISOString();
    }

    /**
     * Notify error
     * @param {*} err Error
     */

    notifyError (...err) {
        this.state.errors.push([...err]);
        logger.error(...err);
        this.emit('error', ...err);
    }
}

module.exports = Eth;
