// HealthCheckAPI.js API handles the health check endpoint by performing an actual IP lookup.

'use strict';

const category = 'HealthCheckAPI';

var logger = require('./lib/config-log4js').getLogger(category),
    config = require('config'),
    debug = require('debug')(category),
    DictionaryStore = require('./lib/DictionaryStore'),
    defaults = {
        scope: 'users',
        uuid: 'Test.Test.Test.Test',
        name: 'TEST_HEALTHCHECK',
        value: { name: 'TEST_HEALTHCHECK', healthy: true }
    },
    _sendResponse,
    _checkResponse;

void logger;
config.util.setModuleDefaults(category, defaults);

class HealthCheckAPI {
    constructor() {
        var self = this;
        debug('constructor()');
        self.dictionaryTestData = {};
        Object.keys(defaults).forEach(function (key) {
            self.dictionaryTestData[key] = config.get(category + '.' + key);
        });
    }

    get(request, response) {
        debug('get()', request.method, request.url);
        var self = this,
            healthy = false,
            dictionaryStore = new DictionaryStore(self.dictionaryTestData);

        dictionaryStore.willSet(self.dictionaryTestData.name,  self.dictionaryTestData.value)
            .then(function (result) {
                healthy = _checkResponse.call(self, result, self.dictionaryTestData.value);
                if (healthy) {
                    dictionaryStore.willGet(
                        self.dictionaryTestData.name,  self.dictionaryTestData.value)
                        .then(function (result) {
                            result.not = false;
                            healthy = _checkResponse.call(
                                self, result, self.dictionaryTestData.value);
                            _sendResponse.call(self, response, healthy);
                        })
                        .catch(function () {
                            _sendResponse.call(self, response, healthy);
                        });
                }
                else {
                    _sendResponse.call(self, response, healthy);
                }
            })
            .catch(function () {
                _sendResponse.call(self, response, healthy);
            });
    }
}

_sendResponse = function (response, healthy) {
    response.status(healthy ? 200 : 500);

    response.json({
        'health.cirrus_users_client': {
            'healthy': false
        },
        'health.db_connection'      : {
            'healthy': healthy
        }
    });
};

_checkResponse = function (actual, expected) {
    var healthy = false;
    try {
        if (Object.keys(expected).length !== Object.keys(actual).length)
        {
            throw new Error('not same length');
        }
        Object.keys(expected).forEach(function (key) {
            if (!(key in actual) ||
                expected[key] !== actual[key]) {
                throw new Error('unhealthy');
            }
        });
        healthy = true;
    } finally {
        if (!healthy) {
            logger.error(process.pid + ' lookup wrong result: ' + JSON.stringify(actual));
            logger.error(process.pid + ' lookup wrong expected: ' + JSON.stringify(expected));
        }
        return healthy;
    }
};

module.exports = HealthCheckAPI;
debug('exports', module.exports);
