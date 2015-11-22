'use strict';

var category = 'Service',
    log = require('./lib/config-log4js'), // must be first to setup
    logger = log.getLogger(category),
    debug = require('debug')(category),
    path = require('path'),
    http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    VersionAPI = require('./VersionAPI'),
    HealthCheckAPI = require('./HealthCheckAPI'),
    DictionaryAPI = require('./DictionaryAPI'),
    swaggerUiMiddleware = require('swagger-ui-middleware'),
    baseUrl = '/dictionaries/api/v1.0';

class Service {

    constructor(apis) {
        debug('constructor()');
        this.apis = apis || {};
        this._initAPI('healthCheckAPI', HealthCheckAPI);
        this._initAPI('versionAPI', VersionAPI);
        this._initAPI('dictionaryAPI', DictionaryAPI);
    }

    _initAPI(name, APIClass) {
        this[name] = this.apis[name]
            ? this.apis[name]
            : new APIClass();
    }

    start(port) {
        var app = express(),
            healthCheckAPI = this.healthCheckAPI,
            dictionaryAPI = this.dictionaryAPI,
            versionAPI = this.versionAPI,
            swaggerDir = path.resolve(process.cwd(), 'swagger-ui');

        debug('start()');

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

module.exports = Service;
