/**
 * Module dependencies.
 */
var loader = require('../middleware/loader');


/**
 * Middleware config load phase.
 *
 * This phase will `load` a middleware config, allowing the application to
 * add middlewares from a middleware config.
 *
 * Examples:
 *
 *   app.phase(witty.boot.middleware('config'));
 *
 *   app.phase(witty.boot.middleware({
 *      "initial": {
 *        "connect-powered-by": {
 *          "params": "Witty"
 *        }
 *      }
 *   }));
 *
 * @param {String|Object} options middleware config root dir or the middleware config object
 * @return {Function}
 * @api public
 */
module.exports = function(options) {

  return function routes() {
    loader.load(this, options);
  };
};
