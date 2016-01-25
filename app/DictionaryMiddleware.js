// DictionaryMiddleware.js - sorry, gets scope and uuid from url and adds a
// DictionaryStore to the request

'use strict';

const category = 'DictionaryMiddleware',
    logger = require('./lib/config-log4js').getLogger(category),
    debug = require('debug')(category),
    dictionaryStoreFactory = require('./lib/DictionaryStore');

class DictionaryMiddleware {
    constructor (mockDictionaryStoreFactory) {
        this.factory = mockDictionaryStoreFactory || dictionaryStoreFactory;
        debug('constructor()');
    }

    addsDictionaryStore (request, response, next) {
        const scope = request.params.scope,
            uuid = request.params.uuid;
        logger.info(request.type + ' scope ' + scope + ' uuid ' + uuid);

        request.dictionaryStore = this.factory.create({
            scope: scope,
            uuid: uuid
        });
        next();
    }
}

module.exports = DictionaryMiddleware;