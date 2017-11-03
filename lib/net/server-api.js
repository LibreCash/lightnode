const
    logger = require('../logger');

function getPing(req, res, next) {
    logger.info('getPing success');
    res.json({
        res: 'pong',
        banner: 'LibreBank node server',
        apiVersion: 1.0
    })
}
function getNodeRate(req, res, next) {
    logger.info('getNodeRate success');
}
function getNodeState(req, res, next) {
    logger.info('getNodeState success');
}
function getPoolNotifications(req, res, next) {
    logger.info('getPoolNotifications success');
}

module.exports = {
    getPing: getPing,
    getNodeRate: getNodeRate,
    getNodeState: getNodeState,
    getPoolNotifications: getPoolNotifications
};
