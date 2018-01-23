var apiconf = {
    name: 'REST API',
    methods: {
        ping: { // GET
            connectionId: 'string',
            DESCRIPTION: 'Ping pong'
        },
        login: {
            POST: true,
            ROUTEEXTRA: " options.passport.authenticate('local'),",
//            ROUTEEXTRA: "jwt({secret: secretCallback}),",
            username: 'string',
            password: 'password',
            DESCRIPTION: 'Passport login authentication'
        },
        connect: { // GET
            apiVersion: 'string',
            apiKey: 'string',
            res: {
                connectionId: 'string'
            },
            DESCRIPTION: 'Create connection'
        },
        disconnect: { // GET
            connectionId: 'string',
            DESCRIPTION: 'Destroy connection'
        }, 
        nodeTickers: { // GET
            connectionId: 'string',
            token: 'string',
            DESCRIPTION: 'Get node tickers'
        },
        nodeState: { // GET
            connectionId: 'string',
            nodeId: 'string',
            res: {
                info: 'string',
                uptime: 'date',
                exchanges: 'array'
            },
            DESCRIPTION: 'Get node state'
        },
        poolNotifications: { // GET
            connectionId: 'string',
            index: 'int',
            count: 'int',
            res: {
                notifications: 'array'
            },
            DESCRIPTION: 'Pool notifications *R1 (*R1: read from db)'
        },
        nodeOnOff: { // GET
            connectionId: 'string',
            onoff: 'string', // on, off, shutdown
            DESCRIPTION: 'LightNode on/off/shutdown'
        },
        nodeExchangeOnOff: { // GET
            connectionId: 'string',
            onoff: 'string', // on, off
            DESCRIPTION: 'LightNode exchange on/off'
        }
    },
    // todo: events
    events: {
        node: {
            type: ['added', 'deleted', 'connected', 'disconnected']
        },
        error: {
            ERR1: 'rate difference is out of range'
        }
    }
};

module.exports = apiconf
