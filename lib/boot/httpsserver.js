/**
 * Listen for HTTP requests.
 *
 * This phase creates an HTTP server and listens for requests on the given
 * address and port, defaulting to 0.0.0.0:3001.
 *
 * This phase is typically one of the final phases in the boot sequence.
 * Initializers should be run and routes should be drawn prior to this phase,
 * ensuring that the application is fully prepared to handle requests.
 *
 * Examples:
 *
 *   app.phase(witty.boot.httpsServer(8080, {key: fs.readFileSync('...'), cert: fs.readFileSync('...')}));
 *
 *   app.phase(witty.boot.httpsServer(8080, '127.0.0.1', {key: fs.readFileSync('...'), cert: fs.readFileSync('...')}));
 *
 *   app.phase(witty.boot.httpsServer({ address: '127.0.0.1', port: 8080, key: fs.readFileSync('...'), cert: fs.readFileSync('...')}));
 *
 * @param {Number} port
 * @param {String} address
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function (port, address, options) {
  var https = require('https');

  if (typeof address == 'object') {
    options = address;
    address = undefined;
  } else if (typeof port == 'object') {
    options = port;
    address = undefined;
    port = undefined;
  }
  options = options || {};

  return function httpsServer(done) {
    var that = this;
    port = port || options.port || this.get('port') || 3001;
    address = address || options.address || this.get('address') || '0.0.0.0';

    https.createServer({key: options.key, cert: options.cert}, that.express).listen(port, address, function () {
      var addr = this.address();
      console.info('HTTP server listening on %s:%d', addr.address, addr.port);
      return done();
    });
  };
};
