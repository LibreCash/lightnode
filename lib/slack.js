const Slackbot = require('slackbots');

class Slack {

    /**
     * Constructor
     * @param {SlackOptions} options
     */

    constructor (options) {
        this.bot = new Slackbot({
            token: options.token,
            name: options.name
        });
        this.channel = options.channel;
    }

    /**
     * Send message
     * @param {String} message Message
     * @param {*} params Slackbot params
     */

    send (message, params) {
        this.bot.postMessageToChannel(this.channel, message, params);
    }
}

module.exports = Slack;
