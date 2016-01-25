// DictionaryAPI.js handle request parameters and use DictionaryStore to provide results
/* jshint maxparams: 4 */

'use strict';

const category = 'DictionaryAPI',
    logger = require('./lib/config-log4js').getLogger(category),
    debug = require('debug')(category);

debug('logger', logger);

class DictionaryAPI {

    get(request, response) {
        return this._handleNamedItem('get', 'willGet', request, response);
    }

    put(request, response) {
        return this._handleNamedItem('put', 'willSet', request, response);
    }

    delete(request, response) {
        return this._handleNamedItem('delete', 'willDelete', request, response);
    }

    getCollection(request, response) {
        const self = this,
            reqQuery = request.query,
            filters = reqQuery.filters,
            dictionaryStore = request.dictionaryStore,
            scope = dictionaryStore.scope,
            uuid = dictionaryStore.uuid,
            query = [scope, uuid, JSON.stringify(filters)].join('/');

        debug('getCollection', query);
        return dictionaryStore.willGetCollection(filters)
            .then(function (result) {
                try {
                    logger.info('OK get: ' + query);
                    response.json(result);
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
            dictionaryStore = request.dictionaryStore,
            scope = dictionaryStore.scope,
            uuid = dictionaryStore.uuid,
            dictionaryName = request.params.dictionaryName,
            dictionaryValue = request.body,
            query = [scope, uuid, dictionaryName].join('/');

        debug(name, query);
        return dictionaryStore[method](dictionaryName, dictionaryValue)
            .then(function (result) {
                try {
                    logger.info('OK ' + name + ': ' + query);
                    response.json(result);
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
