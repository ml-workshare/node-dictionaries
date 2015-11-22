'use strict';

var category = 'Service',
    log = require('./lib/config-log4js'), // must be first to setup
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
    baseUrl = '/dictionaries/api/v1.0',
    privates = {
        healthCheckAPI: new WeakMap(),
        versionAPI: new WeakMap(),
        dictionaryAPI: new WeakMap()
    },
    _initAPI;

class Service {

    constructor (apis) {
        debug('constructor()');
        this.apis = apis || {};
        _initAPI.call(this, 'healthCheckAPI', HealthCheckAPI);
        _initAPI.call(this, 'versionAPI', VersionAPI);
        _initAPI.call(this, 'dictionaryAPI', DictionaryAPI);
        delete this.apis;
    }

    start (port) {
        var app = express(),
            healthCheckAPI = privates.healthCheckAPI.get(this),
            dictionaryAPI = privates.dictionaryAPI.get(this),
            versionAPI = privates.versionAPI.get(this),
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

        var singleEntryUrl = baseUrl + '/:scope/:uuid/dictionaries/:dictionaryName.json';
        var allUrl = baseUrl + '/:scope/:uuid/dictionaries.json';

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
        return category + ' ' + JSON.stringify(this._privates);
    }

    get _privates () {
        var self = this, _privates = {};

        Object.keys(privates).forEach(function (key) {
            _privates[key] =
                JSON.parse(JSON.stringify(privates[key].get(self)));
            void util;
//            _privates[key] = util.inspect(privates[key].get(self));
        });
        return _privates;
    }
}

_initAPI = function (name, APIClass) {
    var api = this.apis[name] ? this.apis[name] : new APIClass();
    privates[name].set(this, api);
};

module.exports = Service;

