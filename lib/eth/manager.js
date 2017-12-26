/** Ethereum manager
 * Manage local web3 & infura networks
 */

let 
    web3 = require('plugins/web3'),
    infura = require('plugins/infura');

class Manager {
    constructor () {
        this.plugins = {
            web3: web3,
            infura: infura
        };
        this.pluginsOrder = ['web3', 'infura'];
    }

    async pushToBlockchain (avg) {
        avg = avg * 100;
        logger.debug(`eth: avarage rate ${avg}`);
        logger.debug("eth: sendt transaction...");
        mainAccount = await web3.eth.getCoinbase();
   
        for (var pluginId in this.pluginsOrder) {
            var plugin = plugins[pluginId];
            if (plugin.getStatus().running) {
                plugin.pushToBlockchain(avg);
            }
        }
    }
}

module.exports = Manager;
