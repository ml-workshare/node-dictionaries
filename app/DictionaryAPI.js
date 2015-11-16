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

        debug('get');
        var self = this,
            scope = request.params.scope,
            uuid = request.params.uuid,
            dictionaryName = request.params.dictionaryName,
            dictionaryStore = new DictionaryStore ({
                scope: scope,
                uuid: uuid
            });

        dictionaryStore.willGet(dictionaryName)
            .then(function (result) {
                try {
                    logger.info('OK get: ' + [scope,  uuid,  dictionaryName].join('/'));
                    response.status(200)
                        .json(JSON.parse(result));
                }
                catch (error)
                {
                    self.errorSync(response, error, result);
                }
            })
            .catch(function (error) {
                self.errorSync(response, error);
            });

    }

    errorSync (response, error, result) {
        logger.error(error);
        if (result) {
            logger.error('from result: ', result);
        }
        response.status(404)
            .send(error);
    }
}

module.exports = DictionaryAPI;
