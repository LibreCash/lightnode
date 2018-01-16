const
    EventEmitter = require('events'),
    Web3 = require('web3'),
    logger = require('../logger');

class Web3Client extends EventEmitter {

    /**
     * Constructor
     */

    constructor (name) {
        super();

        this.name = name;
        this.web3Connected = false;
    }

    /**
     * Init
     * @param {Web3ClientOptions} options
     */

    async init (options) {
        try {
            var url = options.url;
            this.url = url;
            if (url.indexOf('ws:') != -1)
                this.initWebSocketProvider(url);
            else
                this.initHttpProvider(url);
            
            this.initBlockchain();
            this.initContract(options);
            await this.initWallet(options);
        }
        catch (e) {
            this.notifyError('WEB3CLIENT_ERROR_INIT', e.toString());
        }
    }

    /**
     * Init HTTP provider
     * @param {String} url
     */

    initHttpProvider (url) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(url));
    }

    /**
     * Init WebSocket provider
     * @param {String} url
     */

    initWebSocketProvider (url) {
        var self = this;
        var web3Provider = new Web3.providers.WebsocketProvider(url);
        web3Provider.on('connect', ()=>{
            self.web3Connected = true;
            self.notify('WEB3CLIENT_CONNECTED');
        });
        web3Provider.on('end', ()=>{
            self.web3Connected = false;
            self.notify('WEB3CLIENT_DISCONNECTED');
        });
        web3Provider.on('error', (e)=>{
            self.notifyError('WEB3CLIENT_ERROR', e);
        });
        this.web3 = new Web3(web3Provider);
    }

    /**
     * Init blockchain
     */

    initBlockchain() {
        this.web3.eth.subscribe('newBlockHeaders', (error, event) => {
            // check by timer
            logger.debug(this.name, 'newBlockHeaders', event, error);
        });
    }

    /**
     * Init contract
     * @param {Web3ClientOptions} options
     */

    initContract (options) {
        this.contract = new this.web3.eth.Contract(options.abiArray, options.address);

        this.contractAttachEvents();
    }

    /**
     * Attach contract events
     */

    contractAttachEvents () {
        this.contract.events.NewOraclizeQuery({}, (error, event) => {
            if (error) {
                this.notifyError('NewOraclizeQuery', error);
                return;
            }
            this.notify('NewOraclizeQuery', event);
        });
    }

    /**
     * Contract push to blockchain
     * @param {Number} avg 
     * @param {*} options 
     */

    async contractPushToBlockchain (avg, options) {
        var transaction = await this.contract.methods.__callback(avg).send({
            from: options.from, 
            gas: options.gasLimit
        });


    }

    /**
     * Init wallet
     * @param {*} options Options
     */

    async initWallet (options) {
        await this.checkSenderWallet(options);
    }

    /**
     * Check sender wallet
     * @param {*} options Options
     */
    
    async checkSenderWallet (options) {
        let account = await this.web3.eth.getCoinbase();
        let balance = await this.web3.eth.getBalance(account);

        // walletUnlock [

        // walletIsPresent
        if (!account) {
            this.notifyError('WEB3CLIENT_ERROR_ACCOUNT_NOT_PRESENT', address);
        }

        if (!account) {
            this.notifyError('WEB3CLIENT_ERROR_ACCOUNT_BAD_PASSWORD', account);
        }
        // walletIsLocked

        this.web3.eth.personal.unlockAccount(account, options.password, 999999);
        var locked = false;
        if (locked) {
            this.notifyError('WEB3CLIENT_ERROR_ACCOUNT_IS_LOCKED', account);
        }

        // walletUnlock ]

        // walletGetBalance
//        var balance = 0;
        if (balance < options.minimumBalance) {
            this.notifyError('WEB3CLIENT_ERROR_ACCOUNT_LOW_BALANCE', account, balance);
        }

    }

    /**
     * Create wallet
     */

    createWallet () {
        this.web3.eth.accounts.create();
    }

    /**
     * Get info
     */

    async getInfo () {
        var defaultBlock = web3.eth.defaultBlock;
        var protocolVersion = await web3.eth.getProtocolVersion();
        var syncing = await web3.eth.isSyncing();
        var account = await web3.eth.getCoinbase();
    }

    async fullApiTest() {
        // eth
        // web3.eth.isMining()
        // web3.eth.getHashrate()
        // web3.eth.getGasPrice()
        // web3.eth.getAccounts()
        // web3.eth.getBlockNumber()
        // web3.eth.getBalance(account)
        // web3.eth.getStorageAt(account, 0)
        // web3.eth.getCode(address)
        // web3.eth.getBlock(0|hash)
        // web3.eth.getBlockTransactionCount(0|hash)
        // web3.eth.getUncle(0|hash, 0)
        // web3.eth.getTransaction(transactionHash)
        // web3.eth.getTransactionFromBlock(0|hash, 0)
        // web3.eth.getTransactionReceipt(transactionHash)
        // web3.eth.getTransactionCount(address)
        // web3.eth.sendTransaction(transactionObject)
        // web3.eth.sendSignedTransaction(signedTransactionData)
        // web3.eth.sign(dataToSign, address)
        // web3.eth.signTransaction(transactionObject, address)
        // web3.eth.estimateGas(callObject)
        // web3.eth.getPastLogs(options)
        // web3.eth.getCompilers()
        // web3.eth.compile.solidity(sourceCode)
        // web3.eth.compile.lll(sourceCode)
        // web3.eth.compile.serpent(sourceCode)
        // web3.eth.getWork()
        // web3.eth.submitWork(nonce, powHash, digest)
        // eth.subscribe
        // web3.eth.subscribe(type)
        // web3.eth.clearSubscriptions()
        // web3.eth.subscribe('pendingTransactions')
        // web3.eth.subscribe('newBlockHeaders')
        // web3.eth.subscribe(“syncing”)
        // web3.eth.subscribe(“logs”)
        // web3.eth.personal.newAccount(pass)


    }

    /**
     * Notify
     * @param {*} msg Message
     */

    notify (...msg) {
        logger.debug(this.name, ...msg);
        this.emit('event', this.name, ...msg);
    }

    /**
     * Notify error
     * @param {*} error Error
     */

    notifyError (...err) {
        logger.error(this.name, ...err);
        this.emit('event', this.name, ...err);
    }
}

module.exports = Web3Client
