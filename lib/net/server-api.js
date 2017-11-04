const
    logger = require('../logger');

function getPing(req, res, next) {
    logger.info('getPing success');
    res.json({
        res: 'pong',
        banner: 'LibreBank node server',
        apiVersion: '1.0'
    });
}

function getConnect(req, res, next) {
    logger.info('getConnect success');
    res.json({
    });
}

function getDisconnect(req, res, next) {
    logger.info('getDisconnect success');
    res.json({
    });
}

function getNodeRate(req, res, next) {
    logger.info('getNodeRate success');
    res.json({

    });
}

function getNodeState(req, res, next) {
    logger.info('getNodeState success');
    res.json({
    }); 
}

function getPoolNotifications(req, res, next) {
    logger.info('getPoolNotifications success');
    res.json({
    }); 
}

module.exports = {
    getPing: getPing,
    getConnect: getConnect,
    getDisconnect: getDisconnect,
    getNodeRate: getNodeRate,
    getNodeState: getNodeState,
    getPoolNotifications: getPoolNotifications
}
