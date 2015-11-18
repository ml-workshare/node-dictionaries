// DictionaryAPI.js handle request parameters and use DictionaryStore to provide results
/* jshint maxparams: 4 */

'use strict';

var category = 'DictionaryAPI',
    logger = require('./lib/config-log4js').getLogger(category),
    debug = require('debug')(category),
    DictionaryStore = require('./lib/DictionaryStore');

debug('logger', logger);

class DictionaryAPI {

    constructor() {
        debug('constructor');
    }

    get(request, response) {

        var self = this,
            scope = request.params.scope,
            uuid = request.params.uuid,
            dictionaryName = request.params.dictionaryName,
            query = [scope,  uuid,  dictionaryName].join('/'),
            dictionaryStore = new DictionaryStore ({
                scope: scope,
                uuid: uuid
            });

        debug('get', query);
        dictionaryStore.willGet(dictionaryName)
            .then(function (result) {
                try {
                    logger.info('OK get: ' + query);
                    response.status(200)
                        .json(result);
                }
                catch (error)
                {
                    self.errorSync(response, query, error, result);
                }
            })
            .catch(function (error) {
                self.errorSync(response, query, error);
            });

    }

    put(request, response) {

        debug('put');
        var self = this,
            scope = request.params.scope,
            uuid = request.params.uuid,
            dictionaryName = request.params.dictionaryName,
            dictionaryValue = request.body,
            query = [scope,  uuid,  dictionaryName].join('/'),
            dictionaryStore = new DictionaryStore ({
                scope: scope,
                uuid: uuid
            });

        debug('put', query, dictionaryValue);
        dictionaryStore.willSet(dictionaryName, dictionaryValue)
            .then(function (result) {
                try {
                    logger.info('OK put: ' + query);
                    response.status(200)
                        .json(result);
                }
                catch (error)
                {
                    self.errorSync(response, query, error, result);
                }
            })
            .catch(function (error) {
                self.errorSync(response, error);
            });

    }

    delete(request, response) {

        var self = this,
            scope = request.params.scope,
            uuid = request.params.uuid,
            dictionaryName = request.params.dictionaryName,
            query = [scope,  uuid,  dictionaryName].join('/'),
            dictionaryStore = new DictionaryStore ({
                scope: scope,
                uuid: uuid
            });

        debug('delete', query);
        dictionaryStore.willDelete(dictionaryName)
            .then(function (result) {
                try {
                    logger.info('OK delete: ' + query);
                    response.status(200)
                        .json(result);
                }
                catch (error)
                {
                    self.errorSync(response, query, error, result);
                }
            })
            .catch(function (error) {
                self.errorSync(response, query, error);
            });

    }

    errorSync (response, query, error, result) {
        logger.error(query + ': ' + error);
        if (result) {
            logger.error('from result: ', result);
        }
        response.status(404)
            .send(error);
    }
}

module.exports = DictionaryAPI;
