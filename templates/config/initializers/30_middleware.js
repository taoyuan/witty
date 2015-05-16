var express = require('express')
  , poweredBy = require('connect-powered-by')
  , favicon = require('serve-favicon')
  , serveStatic = require('serve-static')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , errorHandler = require('errorhandler');

module.exports = function() {
  // Use middleware.  Standard [Connect](http://www.senchalabs.org/connect/)
  // middleware is built-in, with additional [third-party](https://github.com/senchalabs/connect/wiki)
  // middleware available as separate modules.
  if ('development' == this.env) {
    this.use(require('morgan')('combined'));
  }

  this.use(poweredBy('Witty'));
  this.use(favicon(__dirname + '/../../public/favicon.ico'));
  this.use(serveStatic(__dirname + '/../../public'));
  this.use(bodyParser.urlencoded({ extended: false }));
  this.use(bodyParser.json());
  this.use(methodOverride());
  this.use(this.router);
  this.use(errorHandler());
};
