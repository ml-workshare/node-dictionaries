// DictionaryStore.js - (sorry) Dictionary storage for a given user and scope

'use strict';

var category = 'Dictionary',
    logger = require('./config-log4js').getLogger(category),
    debug = require('debug')(category);

class DictionaryStore {
    constructor(options) {
        debug('constructor()');
        this.uuid = options.uuid;
        this.scope = options.scope;
    }

    willSet(name, value) {
        debug('willSet()', name, value);
    }

    willDelete(name) {
        debug('willDelete()', name);
    }

    willGet(name) {
        debug('willGet()', name);
    }

    willGetCollection(filters) {
        debug('willGetCollection()', filters);
    }

    getErrorSync(error) {
        logger.error(process.pid + ' ', error);
        return {
            error_code: 'die',
            error_msg: error
        };
    }
}

module.exports = DictionaryStore;
debug('exports', module.exports);
