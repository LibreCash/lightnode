const
  express = require('express'),
  fs = require('fs'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

options = {
  address: '0x631086e57bbf0fF6FE3Ce02B705DCa076a71072c',
  abiPath: '../../bin/OurOracle.abi',
  binPath: '../../bin/OurOracle.bin',
  sourcePath: '../../smartcontract.sol',
  from: '0x32A3AA73A5eC44CE70ddf0D9372aA52bA793871E'
}

app.use('/', index);
app.use('/*', (req, res, next) => {
  res.render('01-sample-test', {
    address: options.address, 
    abi: fs.readFileSync(options.abiPath),
    bin: fs.readFileSync(options.binPath),
    source: fs.readFileSync(options.sourcePath),
    from: options.from,
  })
});

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

module.exports = app;
