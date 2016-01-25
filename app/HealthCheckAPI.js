// HealthCheckAPI.js API handles the health check endpoint by performing an actual IP lookup.

'use strict';

const category = 'HealthCheckAPI',
    logger = require('./lib/config-log4js').getLogger(category),
    config = require('config'),
    debug = require('debug')(category),
    dictionaryStoreFactory = require('./lib/DictionaryStore'),
    defaults = {
        scope: 'users',
        uuid: 'Test.Test.Test.Test',
        name: 'TEST_HEALTHCHECK',
        value: { name: 'TEST_HEALTHCHECK', healthy: true }
    };

var _willCheckDictionarySetHealth,
    _willCheckDictionaryGetHealth,
    _willCheckCirrusHealth,
    _getPromiseToCheckResults,
    _sendHealthResponse,
    _sendResponse,
    _checkResponse;

config.util.setModuleDefaults(category, defaults);

class HealthCheckAPI {
    constructor(mockDictionaryStoreFactory) {
        const self = this,
            factory = mockDictionaryStoreFactory || dictionaryStoreFactory;
        debug('constructor()');
        self.dictionaryTestData = {};
        Object.keys(defaults).forEach(function (key) {
            self.dictionaryTestData[key] = config.get(category + '.' + key);
        });
        self.dictionaryStore = factory.create({
            scope: self.dictionaryTestData.scope,
            uuid: self.dictionaryTestData.uuid
        });
    }

    get(request, response, next) {
        debug('get()', request.method, request.url);
        const self = this,
            results = [], responseJSON = {
                'health.cirrus_users_client': { healthy: false },
                'health.db_connection'      : { healthy: false }
            };

        function eventually (where, healthy) {
            debug('eventually', where, results.length);
            results.push(healthy);
            if (results.length >= 2) {
                debug('eventually send');
                _sendHealthResponse.call(self, response, responseJSON, next);
            }
        }

        _willCheckCirrusHealth.call(self)
            .then(function (healthy) {
                responseJSON['health.cirrus_users_client'].healthy = healthy;
                eventually.call(self, 'cirrus', healthy);
            });

        _willCheckDictionarySetHealth.call(self)
            .then(function (healthy) {
                debug('_willCheckDictionarySetHealth handle');
                responseJSON['health.db_connection'].healthy = healthy;
                if (healthy) {
                    _willCheckDictionaryGetHealth.call(self)
                        .then(function (healthy) {
                            responseJSON['health.db_connection'].healthy = healthy;
                            eventually.call(self, 'dbget', healthy);
                        });
                }
                else {
                    eventually.call(self, 'dbset', healthy);
                }
            });

    }
}

_willCheckCirrusHealth = function () {
    return new Promise(function (fulfill) {
        process.nextTick(function () {
            debug('_willCheckCirrusHealth fulfill');
            fulfill(false); // TODO implement
        });
    });
};

_willCheckDictionarySetHealth = function () {
    const self = this,

        promiseToSetDictionary = new Promise(function (fulfill, reject) {
            self.dictionaryStore.willSet(
                self.dictionaryTestData.name, self.dictionaryTestData.value)

                .then(function (result) {
                    debug('promiseToSetDictionary fulfill', result);
                    fulfill(result);
                })
                .catch(function (reason) {
                    debug('promiseToSetDictionary reject', reason);
                    reject(reason);
                });
        }),

        promiseToCheckResults = _getPromiseToCheckResults.call(this, promiseToSetDictionary);

    return promiseToCheckResults;
};

_willCheckDictionaryGetHealth = function () {
    const self = this,

        promiseToGetDictionary = new Promise(function (fulfill, reject) {
            self.dictionaryStore.willGet(self.dictionaryTestData.name)

                .then(function (result) {
                    debug('promiseToGetDictionary fulfill', result);
                    fulfill(result);
                })
                .catch(function (reason) {
                    debug('promiseToGetDictionary reject', reason);
                    reject(reason);
                });
        }),

        promiseToCheckResults = _getPromiseToCheckResults.call(this, promiseToGetDictionary);

    return promiseToCheckResults;
};

_getPromiseToCheckResults = function (dependentPromise) {
    const self = this;
    return new Promise(function (fulfill) {
        dependentPromise
            .then(function (result) {
                debug('promiseToCheckResults set fulfill', result);
                const healthy = _checkResponse.call(
                    self, result, self.dictionaryTestData.value);
                debug('promiseToCheckResults set fulfill', healthy);
                fulfill(healthy);
            });
    });
};

_sendHealthResponse = function (response, json, next) {
    const healthy = json['health.cirrus_users_client'].healthy &&
        json['health.db_connection'].healthy;
    next = next || function () {};
    response.status(healthy ? 200 : 500);
    response.json(json);
    next(); // for the test plan!!
};

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
