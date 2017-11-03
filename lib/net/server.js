const
    route = require('./server-route'),
    express = require('express'),
    fs = require('fs'),
    path = require('path'),
//    favicon = require('serve-favicon'),
//    logger = require('morgan'),
//    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');


var initialized = false;

function setup(options) {
    if (initialized)
        return;

    initialized = true;

    console.log('server options:', options)
    
    var app = express();

    // todo: express options

    app.set('port', options.port);

//    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
//    app.use(cookieParser());
    
    route.initRoute(app);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
    
    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
    
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
}

function start(options) {
    setup(options);
}

function stop() {
    // todo: refactor to external process (express can't restart)
    console.log('server stop() is not implemented. try restart process');
}

module.exports = {
    start: start,
    stop: stop
}
