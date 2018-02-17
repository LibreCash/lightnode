const
    EventEmitter = require('events'),
    delay = require('../helpers.js').delay,
    Web3 = require('web3'),
    fs = require('fs'),
    logger = require('../logger');

class Web3Client extends EventEmitter {

    /**
     * Constructor
     */

    constructor (name) {
        super();

        this.name = name;
        this.web3Connected = false;
        this.walletData = null;
    }

    /**
     * Init
     * @param {Web3ClientOptions} options
     */

    async init (options) {
        try {
            this.options = options;
            var url = options.url;
            if (url.indexOf('ws:') != -1)
                this.initWebSocketProvider(url);
            else
                this.initHttpProvider(url);
            
            this.startTimer();

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
        
        // destory old provider for reconnect
        
        if (this.web3Provider) {
            this.web3Provider.removeAllListeners();
            this.web3Provider.reset();
        }
        
        // create new provider

        var web3Provider = new Web3.providers.WebsocketProvider(url);
        this.web3Provider = web3Provider;
        web3Provider.on('connect', ()=>{
            self.web3Connected = true;
            self.notify('WEB3CLIENT_CONNECTED');
        });
        web3Provider.on('end', ()=>{
            if (!self.web3FirstRunDone || self.web3Connected)
                self.notify('WEB3CLIENT_DISCONNECTED');
            self.web3Connected = false;
            self.web3FirstRunDone = true;
            self.web3NeedWebsocketReconnect = true;
        });
        web3Provider.on('error', (e)=>{
            if (!self.web3FirstRunDone || self.web3Connected)
                self.notifyError('WEB3CLIENT_ERROR', e);
        });
        this.web3 = this.web3 || new Web3();
        this.web3.setProvider(web3Provider);
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
            // todo: recheck
/*            if (error) {
                this.notifyError('NewOraclizeQuery', event);
                return;
            }*/
            this.notify('NewOraclizeQuery', error, event);
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
        this.notify('contractPushToBlockchain', transaction);
    }

    /**
     * Start timer
     */

    startTimer () {
        this.timerOn = true;
        this.timerUpdate();
    }

    /**
     * Stop timer
     */

    stopTimer () {
        this.timerOn = false;
    }

    /**
     * Timer update
     */

    timerUpdate () {
        if (!this.timerOn)
            return;

        if (this.web3Provider) {
            // check websocket reconnect
            if (this.web3NeedWebsocketReconnect) {
                this.web3NeedWebsocketReconnect = false;
                logger.debug('try websocket reconnect');
                this.initWebSocketProvider(this.options.url);
            }
        }
        else {
            // check http get event
        }
        

        delay(this.options.updateTimeout * 1000).then(this.timerUpdate.bind(this));
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

        await this.web3.eth.personal.unlockAccount(account, this.options.password, 999999);
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

    createWallet (options) {
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

    async loadWallet(options) {
        console.log(options);
        let 
            utcFile = JSON.parse(fs.readFileSync(options.utcFile)),
            data = await this.web3.eth.accounts.decrypt(utcFile,options.password);

        console.log(data);
    }
}

module.exports = Web3Client
