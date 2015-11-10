// DictionaryStore.js - (sorry) Dictionary storage for a given user

'use strict';

var category = 'Dictionary',
    logger = require('./config-log4js').getLogger(category),
    debug = require('debug')(category);


class DictionaryCollection {
    constructor(options) {
        debug('constructor()');
        this.uuid = options.uuid;
        this.scope = options.scope;
    }

    willSet(name, value) {
        debug('willSet()', arguments);
    }

    willDelete(name) {
        debug('willDelete()', arguments);
    }

    willGet(name) {
        debug('willGet()', arguments);
    }

    willGetCollection(filters) {
        debug('willGetCollection()', arguments);
    }

    getErrorSync() {
        logger.error(process.pid + ' ' + ipAddress, error);
        return {
            error_code: 'die',
            error_msg: 'error message'
        };
    }
}

module.exports = LocationFinder;
debug('exports', module.exports);
