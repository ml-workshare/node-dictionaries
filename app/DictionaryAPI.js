// DictionaryAPI.js handle request parameters and use DictionaryStore to provide results
/* jshint maxparams: 4 */

'use strict';

const category = 'DictionaryAPI',
    logger = require('./lib/config-log4js').getLogger(category),
    debug = require('debug')(category),
    dictionaryStoreFactory = require('./lib/DictionaryStore');

debug('logger', logger);

class DictionaryAPI {

    get(request, response) {
        this._handleNamedItem('get', 'willGet', request, response);
    }

    put(request, response) {
        this._handleNamedItem('put', 'willSet', request, response);
    }

    delete(request, response) {
        this._handleNamedItem('delete', 'willDelete', request, response);
    }

    getCollection(request, response) {
        const self = this,
            dictionaryFilters = request.query,
            dictionaryStore = request.dictionaryStore,
            query = [dictionaryStore.scope, dictionaryStore.uuid,
                JSON.stringify(dictionaryFilters)].join('/');

        debug('get', query);
        dictionaryStore.willGetCollection(dictionaryFilters.filters)
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

    errorSync (response, query, error, result) {
        logger.error(query + ': ' + error);
        if (result) {
            logger.error('from result: ', result);
        }
        response.status(404)
            .send(error);
    }

    _handleNamedItem(name, method, request, response) {

        const self = this,
            scope = request.params.scope,
            uuid = request.params.uuid,
            dictionaryName = request.params.dictionaryName,
            dictionaryValue = request.body,
            query = [scope, uuid, dictionaryName].join('/'),
            dictionaryStore = dictionaryStoreFactory.create({
                scope: scope,
                uuid: uuid
            });

        debug(name, query);
        dictionaryStore[method](dictionaryName, dictionaryValue)
            .then(function (result) {
                try {
                    logger.info('OK ' + name + ': ' + query);
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

}

module.exports = DictionaryAPI;
