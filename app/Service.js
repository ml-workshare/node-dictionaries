'use strict';

var category = 'Service',
    log = require('./lib/config-log4js'), // must be first to setup
    logger = log.getLogger(category),
    debug = require('debug')(category),
    path = require('path'),
    http = require('http'),
    express = require('express'),
    VersionAPI = require('./VersionAPI'),
    HealthCheckAPI = require('./HealthCheckAPI'),
    DictionaryAPI = require('./DictionaryAPI'),
    bodyParser = require('body-parser'),
    swaggerUiMiddleware = require('swagger-ui-middleware'),
    baseUrl = '/dictionaries/api/v1.0',
    _initAPI;

class Service {

    constructor(apis) {
        debug('constructor()');
        this.apis = apis || {};
        _initAPI.call(this, 'healthCheckAPI', HealthCheckAPI);
        _initAPI.call(this, 'versionAPI', VersionAPI);
        _initAPI.call(this, 'dictionaryAPI', DictionaryAPI);
    }

    start(port) {
        var app = express(),
            healthCheckAPI = this.healthCheckAPI,
            dictionaryAPI = this.dictionaryAPI,
            versionAPI = this.versionAPI,
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
}

_initAPI = function (name, APIClass) {
    this[name] = this.apis[name]
        ? this.apis[name]
        : new APIClass();
};

module.exports = Service;

