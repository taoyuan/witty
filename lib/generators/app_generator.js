/**
 * lib/generators/app_generator.js
 *
 * @defines {AppGenerator}
 * @since {1.1.4}
 * @creator {Sascha Gehlich <sascha@gehlich.us>}
 * @description {
 *   Generates an entirely new CompoundJS application
 * }
 */

/**
 * Module dependencies
 */
var util = require('util')
  , prompt = require('co-prompt')
  , BaseGenerator = require('./base_generator')
  , path = require('path');

/**
 * Generates an entirely new CompoundJS application
 *
 * @constructor
 */
function AppGenerator() {
  AppGenerator.super_.call(this);
}
util.inherits(AppGenerator, BaseGenerator);

/**
 * Default key name (first command line argument is stored in options[defaultKeyName])
 */
AppGenerator.prototype.defaultKeyName = 'appName';

/**
 * Performs the generator action
 *
 * @param {Array} arguments
 */
AppGenerator.prototype.perform = function (args) {
  var that = this;

  BaseGenerator.prototype.perform.apply(this, [].slice.call(arguments));

  var appname = this.options.appName;

  if (appname) {
    this.baseDir = path.join(this.baseDir, appname);
  }

  console.log('creating witty application at : ' + appname);

  if (this.isBaseDirExists()) {
    prompt.confirm('destination is not empty, continue? ')(function (err, ok) {
      if (err) throw err;
      if (!ok) return process.exit(1);
      process.stdin.destroy();
      that.execute(appname);
    });
  } else {
    that.execute(appname);
  }
};

AppGenerator.prototype.execute = function (appname) {
  this.createDirectoryStructure();
  this.copyFiles();

  process.on('exit', function () {
    console.log();
    console.log('   install dependencies:');
    console.log('     $ cd %s && npm install', appname);
    console.log();
    console.log('   run the app:');
    console.log('     $ node server');
    console.log();
  });
};

/**
 * Creates the basic directory structure
 */
AppGenerator.prototype.createDirectoryStructure = function () {
  var self = this;
  [
    'app/',
    'app/controllers/',
    'app/views/',
    'app/views/pages/',
    'public/',
    'public/fonts',
    'public/images',
    'public/stylesheets/',
    'public/javascripts/',
    'node_modules/',
    'config/',
    'config/initializers/',
    'config/environments/'
  ].forEach(function (dir) {
      self.createDirectory(dir);
    });
};

/**
 * Copy files from templates directory
 */
AppGenerator.prototype.copyFiles = function () {
  var self = this;
  var templateVariables = {
    'ENGINE': this.getEngine(),
    'STYLE': this.getCSSEngineExtension(),
    'CODE': this.getCodeExtension(),
    'TPL': this.getTemplateExtension(),
    'DATA': this.getDataExtension(),
    'VIEWENGINE': this.getTemplateEngine(),
    'CSSENGINE': this.getCSSEngine(),
    'APPNAME': this.getAppName(),
    'SECRET': this.generateSecret(),
    'DBDRIVER': this.getDatabaseDriver(),
    'SUFFIX': this.isEvalAllowed() ? '_controller' : '',
    'EVAL': this.isEvalAllowed() ? '_eval' : '',
    'DBDEPENDENCY': this.getDatabaseDependency()
  };

  [
    'app/controllers/pagesController.js',
    'app/views/pages/main.html.ejs',
    'config/environments/all.js',
    'config/environments/development.js',
    'config/environments/production.js',
    'config/initializers/00_generic.js',
    'config/initializers/01_mime.js',
    'config/initializers/02_views.js',
    'config/initializers/30_middleware.js',
    'config/routes.js',
    //'public/index.html',
    'public/stylesheets/bootstrap.css',
    'public/stylesheets/bootstrap.min.css',
    'public/stylesheets/bootstrap-theme.css',
    'public/stylesheets/bootstrap-theme.min.css',
    'public/stylesheets/styles.css',
    'public/javascripts/bootstrap.js',
    'public/javascripts/bootstrap.min.js',
    'public/fonts/glyphicons-halflings-regular.eot',
    'public/fonts/glyphicons-halflings-regular.svg',
    'public/fonts/glyphicons-halflings-regular.ttf',
    'public/fonts/glyphicons-halflings-regular.woff',
    'public/fonts/glyphicons-halflings-regular.woff2',
    'public/favicon.ico',
    'Procfile',
    'README.md',
    'package.json',
    'server.js'
  ].forEach(function (file) {
      self.copyFile(file, templateVariables);
    });

  self.copyFile('gitignore-example', '.gitignore', {});

};

/**
 * Helper methods for renaming / replacing template variables
 */

module.exports = AppGenerator;
