const
    logger = require('../logger');

var server = null;

function setServer(owner) {
    server = owner;
}

function response(res, obj) {
    console.log('server resopnse', obj);
    res.json(obj);
}

function error(res, error, obj) {
    console.log('server error', error, obj);
    res.json({
        error: error,
        message: obj
    })
}

function getConnection(req, res, next) {
    var connection = server.getConnection(req.params.connectionId);
    if (!connection) {
        error(res, 'CONNECTION_NOT_FOUND', 'connection not found');
        return null;
    }
    return connection;
}

function getPing(req, res, next) {
    logger.info('getPing success');
    response(res, {
        res: 'pong',
        banner: 'LibreBank node server',
        apiVersion: '1.0'
    });
}

function getConnect(req, res, next) {
    logger.info('getConnect success');
/*    
    var apiVersion = req.params.apiVersion;
    var apiKey = req.params.apiKey;

    if (apiVersion != 'v1') {
        error(res, 'BAD_API_VERSION', 'bad api version. v1 is required');
        return;
    }

    var apiKeyFound = server.getOptions().server.lightnodes[apiKey];

    if (!apiKeyFound) {
        error(res, 'BAD_API_KEY', 'bad api key.');
        return;
    }
*/
    var connection = server.createConnection();

    response(res, {
        connectionId: connection.id
    });
}

function getDisconnect(req, res, next) {
    logger.info('getDisconnect success');

    var connection = getConnection(req, res, next);
    if (!connection)
        return;

    var result = connection.server.deleteConnection(connection);
    response(res, {
        code: result,
        message: 'connection deleted'
    });
}

function getNodeRate(req, res, next) {
    logger.info('getNodeRate success');

    var connection = getConnection(req, res, next);
    if (!connection)
        return;

    var rates = connection.server.getNode().getRates();

    response(res, rates);
}

function getNodeState(req, res, next) {
    logger.info('getNodeState success');

    var connection = getConnection(req, res, next);
    if (!connection)
        return;

    var state = connection.server.getNode().exportState();
    response(res, {
        state: state
    }); 
}

function getPoolNotifications(req, res, next) {
    logger.info('getPoolNotifications success');
    response(res, {
        notifications: connection.getNotifications()
    }); 
}

module.exports = {
    setServer: setServer,
    getPing: getPing,
    getConnect: getConnect,
    getDisconnect: getDisconnect,
    getNodeRate: getNodeRate,
    getNodeState: getNodeState,
    getPoolNotifications: getPoolNotifications
}
