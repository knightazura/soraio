/**
  * Module dependencies.
  */
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    path = require('path'),
    routes = require('../core/routes'),
    sassMiddleware = require('node-sass-middleware'),
    flash    = require('connect-flash'),
    session  = require('express-session'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    config = require('../conf/config'),
    compression = require('compression')

/**
  * App setup.
  */
app.set('views', path.join(__dirname, '../core/views'))
app.set('view engine', 'pug')
app.set('view cache', true)
app.set('env', config.environment)
app.use(compression())
app.use(sassMiddleware({
  src: path.join(__dirname, '../public'),
  dest: path.join(__dirname, '../public'),
  indentedSyntax: true,
  sourceMap: true
}))
app.use(express.static(path.join(__dirname, '../public')))
app.use('/node_modules',  express.static(path.join(__dirname, '../node_modules')))
require('../core/passport')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(methodOverride())
//passport setup
app.use(cookieParser('SoraWaJiyuDa'))
app.use(session({
	secret: 'SoraWaJiyuDa',
	resave: true,
	saveUninitialized: true,
  cookie: { maxAge: 60000 }
})) // session secret
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions
app.use(flash()) // use connect-flash for flash messages stored in session
app.use(function(req, res, next) {
    res.locals.site = "Sora Iro Fansubs"
    res.locals.irc = "#sorairo@irc.rizon.net"
    next()
})

/**
  * App routes.
  */
app.use(routes)

/**
  * Error handlers.
  */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  err.status = 403
  err.message = 'Invalid CSRF Token'
  next(err)
})
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    var error = []
    error.message = err.message
    error.status = err.status
    error.stack = err.stack
    res.status(err.status || 500)
    .render('error', {error: error})
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  var error = []
  error.message = err.message
  error.status = err.status
  error.stack = null
  res.status(err.status || 500)
  .render('error', {error: error})
})

/**
  * Module exports
  */
module.exports = app
