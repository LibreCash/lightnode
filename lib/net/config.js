
options = {
    host: 'localhost',
    port: 27925,

    apiKey: 'LIBREBANK-API-KEY-DEV',

    client: {
        pingRate: 10, // seconds
        reconnectTimeout: 15 // seconds
//        reconnectAttempts: 5,
//        reconnectTimeout: 5 // seconds
    },

    server: {

    }
};

module.exports = options;
