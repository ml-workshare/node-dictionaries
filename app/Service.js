'use strict';

var category = 'Service',
    log = require('./lib/config-log4js'), // must be first to setup
    logger = log.getLogger(category),
    debug = require('debug')(category),
    path = require('path'),
    http = require('http'),
    express = require('express'),
//    VersionAPI = require('./VersionAPI'),
//    HealthCheckAPI = require('./HealthCheckAPI'),
    swaggerUiMiddleware = require('swagger-ui-middleware');

class Service {
    constructor(apis) {
        debug('constructor()');
        this.apis = apis || {};
//        this._initAPI('healthCheckAPI', HealthCheckAPI);
//        this._initAPI('versionAPI', VersionAPI);
    }

    _initAPI(name, APIClass) {
        this[name] = this.apis[name] ? this.apis[name] : new APIClass();
    }

    start(port) {
        var app = express(),
//            healthCheckAPI = this.healthCheckAPI,
//            versionAPI = this.versionAPI,
            swaggerDir = path.resolve(process.cwd(), 'swagger-ui');

        debug('start()');

        // automatic access logs provided by logger
        app.use(log.connectLogger(
            log.getLogger('http'),
            { level: 'auto' }
        ));

        swaggerUiMiddleware.hostUI(
            app,
            {
                path: '/api/docs?',
                overrides: swaggerDir
            });

        /*
        app.get('/api/countries(?:\.json)?/:hosts', function(request, response) {
            locationAPI.get(request, response);
        });
        app.get('/admin/healthCheck', function(request, response) {
            healthCheckAPI.get(request, response);
        });

        app.get('/admin/version', function(request, response) {
            versionAPI.get(request, response);
        });
         */

        var server = http.createServer(app);
        server.listen(port, function() {
            logger.info(process.pid + ' Service started on port ' + port);
        });

        return server;
    }
}

module.exports = Service;
