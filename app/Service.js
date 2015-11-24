'use strict';

const category = 'Service',
    baseUrl = '/dictionaries/api/v1.0',
    singleEntryUrl = baseUrl + '/:scope/:uuid/dictionaries/:dictionaryName.json',
    allUrl = baseUrl + '/:scope/:uuid/dictionaries.json';

var log = require('./lib/config-log4js'), // must be first to setup
    logger = log.getLogger(category),
    debug = require('debug')(category),
    path = require('path'),
    http = require('http'),
    util = require('util'),
    express = require('express'),
    VersionAPI = require('./VersionAPI'),
    HealthCheckAPI = require('./HealthCheckAPI'),
    DictionaryAPI = require('./DictionaryAPI'),
    bodyParser = require('body-parser'),
    swaggerUiMiddleware = require('swagger-ui-middleware'),
    privates = new WeakMap(),
    _initAPI,
    _setPrivate;

class Service {

    constructor (apis) {
        debug('constructor()');
        privates.set(this, {});
        this.apis = apis || {};
        _initAPI.call(this, 'healthCheckAPI', HealthCheckAPI);
        _initAPI.call(this, 'versionAPI', VersionAPI);
        _initAPI.call(this, 'dictionaryAPI', DictionaryAPI);
        delete this.apis;
    }

    start (port) {
        var app = express(),
            _privates = privates.get(this),
            healthCheckAPI = _privates.healthCheckAPI,
            dictionaryAPI = _privates.dictionaryAPI,
            versionAPI = _privates.versionAPI,
            swaggerDir = path.resolve(process.cwd(), 'swagger-ui');

        debug('start()', port);

        // automatic access logs provided by logger
        app.use(log.connectLogger(
            log.getLogger('http'),
            { level: 'auto' }
        ));

        // for parsing application/json
        app.use(bodyParser.json());

        swaggerUiMiddleware.hostUI(
            app,
            {
                path: '/api/docs?',
                overrides: swaggerDir
            });

        app.get('/dictionaries/admin/healthCheck', function(request, response) {
            healthCheckAPI.get(request, response);
        });

        app.get('/dictionaries/admin/version', function(request, response) {
            versionAPI.get(request, response);
        });

        app.get(allUrl, function(request, response) {
            dictionaryAPI.getCollection(request, response);
        });

        app.get(singleEntryUrl, function(request, response) {
            dictionaryAPI.get(request, response);
        });

        app.put(singleEntryUrl, function(request, response) {
            dictionaryAPI.put(request, response);
        });

        app.delete(singleEntryUrl, function(request, response) {
            dictionaryAPI.delete(request, response);
        });

        var server = http.createServer(app);
        server.listen(port, function() {
            logger.info(process.pid + ' Service started on port ' + port);
        });

        return server;
    }

    toString () {
        return category + ' ' + JSON.stringify(privates.get(this));
    }

    get _privates () {
        void util;
        return JSON.parse(JSON.stringify(privates.get(this)));
//        return util.inspect(privates.get(this), true, null, true);
    }
}

_initAPI = function (name, APIClass) {
    var api = this.apis[name] ? this.apis[name] : new APIClass();
    _setPrivate.call(this, name, api);
};

_setPrivate = function (key, value) {
    var _privates = privates.get(this);
    _privates[key] = value;
    return this;
};

module.exports = Service;
