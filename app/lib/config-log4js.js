/*
    config-log4js.js

    provide node-config based configuration for log4js because it
    doesn't currently have any.

    an issue has been raised against log4js so something like it
    could be implemented at some point. [2015-10-11]
    https://github.com/nomiddlename/log4js-node/issues/328
*/

'use strict';

const category = 'config:log4js',
    log4js = require('log4js'),
    debug = require('debug')(category),
    mkdirp = require('mkdirp');

var config,
    _configureFromFile,
    _debugConfig;

debug('required');

console.assert(typeof log4js._setMockConfig === 'undefined',
    'ensure we are not overriding something that log4js has added');
console.assert(typeof log4js._configureFromConfig === 'undefined',
    'ensure we are not overriding something that log4js has added');

log4js._setMockConfig = function (mock) {
    debug('_setMockConfig()', mock);
    config = mock;
};

log4js._configureFromConfig = function () {
    config = config || require('config');
    _debugConfig(config);
    debug('_configureFromConfig()', config);
    if (config.has('log4js')) {
        const log4jsConfig = config.get('log4js');
        if (log4jsConfig.has('configureFile')) {
            _configureFromFile(log4jsConfig);
        }
        else {
            debug('from log4js key in config object', log4jsConfig);
            log4js.configure(log4jsConfig);
        }
    }
};

_configureFromFile = function (log4config) {
    const configFromFile = log4config.get('configureFile'),
        fileName = configFromFile.get('fileName'),
        options = configFromFile.has('options') ? configFromFile.get('options') : {};

    var logDir;

    if (options.has && options.has('cwd')) {
        logDir = options.get('cwd');
        debug('create logging dir ' + logDir);
        mkdirp.sync(logDir);
    }

    debug('from JSON file and monitor for hot reload ' + fileName, options);
    log4js.configure(fileName, options);
    if (logDir) {
        log4js.getLogger('config-log4js').info('logging to ' + logDir);
    }
};

// there is no debug instrumentation in the config module itself so we make
// our own debug function
_debugConfig = function (config) {
    var debug = require('debug')('config');
    if (config.util) {
        debug('NODE_ENV: ' + config.util.getEnv('NODE_ENV'));
        debug('NODE_CONFIG_DIR: ' + config.util.getEnv('NODE_CONFIG_DIR'));
        debug('NODE_APP_INSTANCE: ' + config.util.getEnv('NODE_APP_INSTANCE'));
        debug('os.hostname: ' + require('os').hostname());
        debug('HOSTNAME: ' + config.util.getEnv('HOSTNAME'));
        debug('HOST: ' + config.util.getEnv('HOST'));
        debug('NODE_CONFIG: ' + config.util.getEnv('NODE_CONFIG'));
        debug('NODE_CONFIG_STRICT_MODE: ' + config.util.getEnv('NODE_CONFIG_STRICT_MODE'));
        debug('ALLOW_CONFIG_MUTATIONS: ' + config.util.getEnv('ALLOW_CONFIG_MUTATIONS'));
        debug('SUPPRESS_NO_CONFIG_WARNING: ' + config.util.getEnv('SUPPRESS_NO_CONFIG_WARNING'));

        config.util.getConfigSources().forEach(function (source) {
            debug('source: ' + source.name);
        });
    }

    debug = require('debug')('log4js');
    debug('LOG4JS_CONFIG: ' + process.env.LOG4JS_CONFIG);
};

log4js._configureFromConfig();

module.exports = log4js;
