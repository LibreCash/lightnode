var lightnode0 = {
    host: 'localhost',
    port: 27925,

    apiKey: 'LIGHTNODE-0-API-KEY',
};

var lightnode1 = {
    host: 'localhost',
    port: 27950,

    apiKey: 'LIGHTNODE-1-API-KEY',
};

var masternode0 = {
    pingRate: 10, // seconds
    requestRetryCount: 10,
    reconnectTimeout: 15, // seconds
//        reconnectAttempts: 5,
//        reconnectTimeout: 5 // seconds

    lightnodes: {
        'LIGHTNODE-0-API-KEY': {
            host: 'localhost',
            port: 27925,
        },
        'LIGHTNODE-1-API-KEY': {
            host: 'localhost',
            port: 27950,
        }
    }
};

module.exports = {
    lightnode0: lightnode0,
    lightnode1: lightnode1,
    masternode0: masternode0
};
