const
    logger = require('./logger'),
    nodemailer = require('nodemailer');

class Mailer {
    constructor () {
    }

    setup (options) {
        if (!options || !('useTestAccount' in options)) {
            logger.error('mailer bad options');
            return;
        }

        this.options = options;

        if (!options.useTestAccount) {
            nodemailer.createTestAccount((err, account) => {
                logger.log(account);

                var optionsTransport = {
                    host: options.host,
                    port: options.port,
                    secure: options.secure, // true for 465, false for other ports
                    auth: {
                        user: account.user, // generated ethereal user
                        pass: account.pass  // generated ethereal password
                    }
                };
                this.setupTransport(optionsTransport);
                this.sendStartup();
            });
        }
        else {
            this.setupTransport(options);
            this.sendStartup();
        }
    }

    setupTransport (options) {
        this.transporter = nodemailer.createTransport(options);
    }

    sendMail (mailOptions) {
        logger.info('send mail', mailOptions);
        
        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return logger.error(error);
            }
            logger.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            logger.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    }

    sendStartup () {
        let text = `LibreNode started at ${(new Date).toString()}`;

        let mailOptions = {
            from: this.options.from, // sender address
            to: this.options.to, // list of receivers
            subject: 'LibreNode setup ✔', // Subject line
            text: text, // plain text body
            html: `<b>{text}</b>` // html body
        };

        this.sendMail(mailOptions);
    }

    sendNodeTickerOverflow (err) {
        let text = `LibreNode error\n${JSON.stringify(err)}`;

        let mailOptions = {
            from: this.options.from, // sender address
            to: this.options.to, // list of receivers
            subject: 'LibreNode ERROR: ticker overflow', // Subject line
            text: text, // plain text body
            html: `<b>{text}</b>` // html body
        };

        this.sendMail(mailOptions);
    }

    ethereumMessage (msg) {
        let text = `LibreNode ethereum info\n${JSON.stringify(msg)}`;
        
        let mailOptions = {
            from: this.options.from, // sender address
            to: this.options.to, // list of receivers
            subject: 'LibreNode Ethereum info', // Subject line
            text: text, // plain text body
            html: `<b>{text}</b>` // html body
        };

        this.sendMail(mailOptions);
    }

    ethereumError (err) {
        let text = `LibreNode ethereum error\n${JSON.stringify(err)}`;
        
        let mailOptions = {
            from: this.options.from, // sender address
            to: this.options.to, // list of receivers
            subject: 'LibreNode Ethereum error', // Subject line
            text: text, // plain text body
            html: `<b>{text}</b>` // html body
        };

        this.sendMail(mailOptions);
    }

};

module.exports = Mailer;
