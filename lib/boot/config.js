/**
 * Module dependencies.
 */
var ConfigLoader = require('../config-loader');
var utils = require('../utils');

/**
 * Config loading phase.
 *
 * This phase will load a config file.
 *
 * Examples:
 *
 *   app.phase(witty.boot.config('config'));
 *
 * @param {String|Object} options
 * @return {Function}
 * @api public
 */
module.exports = function (options) {
  if ('string' == typeof options) {
    options = {dir: options};
  }
  options = options || {};
  var dir = options.dir || 'config';
  var env = options.env;

  return function config() {
    var cfg = loadAppConfig(dir, env || this.get('env'));
    applyAppConfig(this, cfg);
  };
};

function loadAppConfig(dir, env) {
  return ConfigLoader.load(dir, env, 'config', mergeAppConfig);
}

function mergeAppConfig(target, config, fileName) {
  var err = utils.mergeObjects(target, config);
  if (err) {
    throw new Error('Cannot apply ' + fileName + ': ' + err);
  }
}

function applyAppConfig(app, config) {
  var appConfig = config;
  for (var configKey in appConfig) {
    var cur = app.get(configKey);
    if (cur === undefined || cur === null) {
      app.set(configKey, appConfig[configKey]);
    }
  }
}
