// DictionaryAPI.js handle request parameters and use DictionaryStore to provide results

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

        debug('get');
        dictionaryStore.willGet(dictionaryName)
            .then(function (result) {
                try {
                    logger.info('OK get: ' + query);
                    response.status(200)
                        .json(JSON.parse(result));
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

            // MUSTDO need a body parser to get the payload
            dictionaryValue = JSON.stringify({ payload: true }),

            query = [scope,  uuid,  dictionaryName].join('/'),
            dictionaryStore = new DictionaryStore ({
                scope: scope,
                uuid: uuid
            });

        dictionaryStore.willSet(dictionaryName, dictionaryValue)
            .then(function (result) {
                try {
                    logger.info('OK put: ' + query);
                    response.status(200)
                        .json(JSON.parse(result));
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
