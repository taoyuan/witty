#!/usr/bin/env node

var program = require('commander')
  , witty = require('../');

program.version(witty.version);

program.command('create <dir>')
  .description('-> create Witty application')
  .action(function (path) {
    witty.generators.init(witty);
    witty.generators.perform('app', process.argv.slice(3));
  });

program.command('server')
  .description('-> start Witty server')
  .option('-a, --address [address]', 'listen on specified address (default: 0.0.0.0)')
  .option('-p, --port [port]', 'listen on specified port (default: 3000)', parseInt)
  .option('-e, --env [environment]', 'run in specified environment (default: development)')
  .option('-A, --app [directory]', 'load app at specified directory (default: `pwd`)')
  .option('-w, --watch', 'watch for code changes and reload')
  .option('--use-nodemon', 'use nodemon for automatic reloading (default: supervisor)')
  .option('--debug [port]', 'enable V8 debugger on specified port (default: 5858)', parseInt)
  .option('--debug-brk [port]', 'enable V8 debugger on specified port and break immediately (default: 5858)', parseInt)
  .option('--more', 'use with --help to show more help')
  .action(function (options) {
    options = options || {};
    options.address = options.address || '0.0.0.0';
    options.port = options.port || process.env.PORT || 3000;
    options.env = options.env || process.env.NODE_ENV || 'development';

    // TODO: Implement daemon and cluster mode

    witty.cli.server(options.app || process.cwd(), options.address, options.port, options.env, options);
  }).on('--help', function (options) {
    if (program.rawArgs && program.rawArgs.indexOf('--more') != -1) {
      console.log("  Debugging:");
      console.log();
      console.log("    Witty applications can be debugged by enabling debug mode.");
      console.log();
      console.log("        $ witty server --debug");
      console.log("        $ witty server --debug-brk");
      console.log();
      console.log("    Debug mode activates V8's debugger protocol, so standard Node tools can be");
      console.log("    used.  For example, with Witty running with debug mode enabled, launch");
      console.log("    node-inspector:");
      console.log();
      console.log("        $ node-inspector");
      console.log();
      console.log("    Then launch any WebKit-based browser, such as Chrome or Safari, and open");
      console.log("    http://0.0.0.0:8080/debug?port=5858.  The conventional Web Inspector can be");
      console.log("    used to debug server-side applications.");
      console.log();
      console.log("    Verbose log messages will be written to the console when `witty` is set");
      console.log("    in the DEBUG environment variable.");
      console.log();
      console.log("        $ DEBUG=witty witty server");
      console.log();
    }
  });

program.parse(process.argv);
