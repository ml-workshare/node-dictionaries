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

config.util.setModuleDefaults(category, defaults);

class HealthCheckAPI {
    constructor(dictionaryStore) {
        var self = this;
        debug('constructor()');
        self.dictionaryTestData = {};
        Object.keys(defaults).forEach(function (key) {
            self.dictionaryTestData[key] = config.get(category + '.' + key);
        });
        this.dictionaryStore = dictionaryStore || new DictionaryStore(this.dictionaryTestData);
    }

    get(request, response, next) {
        debug('get()', request.method, request.url);
        var self = this,
            healthy = false;

        self.dictionaryStore.willSet(self.dictionaryTestData.name,  self.dictionaryTestData.value)
            .then(function (result) {
                healthy = _checkResponse.call(self, result, self.dictionaryTestData.value);
                if (healthy) {
                    self.dictionaryStore.willGet(
                        self.dictionaryTestData.name,  self.dictionaryTestData.value)
                        .then(function (result) {
                            healthy = _checkResponse.call(
                                self, result, self.dictionaryTestData.value);
                            _sendResponse.call(self, healthy, response, next);
                        })
                        .catch(function () {
                            _sendResponse.call(self, healthy, response, next);
                        });
                }
                else {
                    _sendResponse.call(self, healthy, response, next);
                }
            })
            .catch(function () {
                _sendResponse.call(self, healthy, response, next);
            });
    }
}

_sendResponse = function (healthy, response, next) {
    next = next || function () {};
    response.status(healthy ? 200 : 500);

    response.json({
        'health.cirrus_users_client': {
            'healthy': false
        },
        'health.db_connection'      : {
            'healthy': healthy
        }
    });
    next(); // for the test plan!!
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
