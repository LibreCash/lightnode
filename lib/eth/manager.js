/** Ethereum manager
 * Manage local web3 & infura networks
 */

const
    fs = require('fs'),
    path = require('path'),
    logger = require('../logger'),
    web3 = require('./plugins/web3'),
    infura = require('./plugins/infura');

class Manager {
    constructor () {
        this.plugins = {
            web3: web3,
            infura: infura
        };
        this.pluginsOrder = ['web3', 'infura'];
    }

    async init(options, callback) {
        let abiArrayPath = path.resolve(options.abiPath);
        logger.debug(`eth loading abiArray from ${abiArrayPath}`);
        let abiArray = JSON.parse(fs.readFileSync(abiArrayPath));

//        var result = await Promise.all(
        this.pluginsOrder.map(async (pluginId) => {
            let plugin = this.plugins[pluginId];
            if (!plugin.getStatus().running) {
                try {
                    logger.info(`eth plugin ${pluginId} init`);
                    plugin.init(abiArray, options, callback);
                    return true;
                }
                catch (e) {
                    logger.error(`eth plugin ${pluginId} init error ${e}`);
                    return false;
                }
            }
        });
//        }));
//        logger.debug('web3 manager ', result);
    }

    async pushToBlockchain (avg) {
        avg = avg * 100;
        logger.debug(`eth: avarage rate ${avg}`);
        logger.debug("eth: sendt transaction...");
        mainAccount = await web3.eth.getCoinbase();
   
        this.pluginsOrder.forEach((pluginId) => {
            let plugin = this.plugins[pluginId];
            if (plugin.getStatus().running) {
                plugin.pushToBlockchain(avg);
            }
        });
    }

    getStatus () {
        var status = [];
        
        this.pluginsOrder.forEach((pluginId) => {
            let plugin = this.plugins[pluginId];
            status.push({
                name: pluginId,
                running: plugin.getStatus().running,
                errors: []
            });
        });

        return status;
    }
    
}

module.exports = Manager;
