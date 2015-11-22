// HealthCheckAPI.js API handles the health check endpoint by performing an actual IP lookup.

'use strict';

const category = 'HealthCheckAPI';

var logger = require('./lib/config-log4js').getLogger(category),
    config = require('config'),
    debug = require('debug')(category),
    defaults = {
        checkIp: '8.8.8.8',
        iso2CountryCode: 'US'
    };
void logger;
config.util.setModuleDefaults(category, defaults);

class HealthCheckAPI {
    constructor() {
        var self = this;
        debug('constructor()');

        Object.keys(defaults).forEach(function (key) {
            self[key] = config.get(category + '.' + key);
        });
    }

    get(request, response, next) {
        debug('get()', request.method, request.url);
        var healthy = false;

        response.status(healthy ? 200 : 500);

        response.json({
            'health.cirrus_users_client': {
                'healthy': false
            },
            'health.db_connection'      : {
                'healthy': false
            }
        });
        next();

        /*
        self.locationFinder
            .willLookup([self.checkIp])
            .then(function(entries){
                debug('then()', entries);
                lookups = entries;
                healthy = (lookups[0].country.iso_code === self.iso2CountryCode);
                if (!healthy) {
                    logger.error(process.pid + ' lookup wrong ' + self.checkIp + ' should be ' +
                        self.iso2CountryCode + ' but got:', lookups[0]);
                }

                response.status(healthy ? 200 : 500);

                response.json({
                    'database': {
                        'healthy': healthy
                    }
                });
                next();
            })
            .catch(function (error) {
                debug('catch() impossible', error);
                logger.error(process.pid + ' ' + error);
                next(error);
        });
        */
    }
}

module.exports = HealthCheckAPI;
debug('exports', module.exports);
