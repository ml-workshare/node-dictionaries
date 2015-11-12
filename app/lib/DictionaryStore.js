// DictionaryStore.js - (sorry) Dictionary storage for a given user and scope

'use strict';

var category = 'Dictionary',
    logger = require('./config-log4js').getLogger(category),
    debug = require('debug')(category),
    mockDB = {};

class DictionaryStore {
    constructor(options) {
        debug('constructor()');
        this.uuid = options.uuid;
        this.scope = options.scope;
    }

    willSet(name, value) {
        debug('willSet()', name, value);
        var self = this;
        return new Promise(function (fulfill) {

            process.nextTick(function () {
                if (!(self.scope in mockDB))
                {
                    mockDB[self.scope] = {};
                }
                if (!(self.uuid in mockDB[self.scope]))
                {
                    mockDB[self.scope][self.uuid] = {};
                }
                mockDB[self.scope][self.uuid][name] = value;

                fulfill(value);
            });

        });
    }

    willDelete(name) {
        debug('willDelete()', name);
        var self = this;
        return new Promise(function (fulfill) {

            process.nextTick(function () {
                if (!(self.scope in mockDB))
                {
                    mockDB[self.scope] = {};
                }
                if (!(self.uuid in mockDB[self.scope]))
                {
                    mockDB[self.scope][self.uuid] = {};
                }
                delete mockDB[self.scope][self.uuid][name];

                fulfill('WHAT SHOULD I RETURN? ' + name);
            });

        });
    }

    willGet(name) {
        debug('willGet()', name);
        var self = this;
        return new Promise(function (fulfill) {

            process.nextTick(function () {
                if (!(self.scope in mockDB))
                {
                    mockDB[self.scope] = {};
                }
                if (!(self.uuid in mockDB[self.scope]))
                {
                    mockDB[self.scope][self.uuid] = {};
                }

                fulfill('WHAT SHOULD I RETURN? ' + mockDB[self.scope][self.uuid][name]);
            });

        });
    }

    willGetCollection(filters) {
        debug('willGetCollection()', filters);
        var self = this;
        return new Promise(function (fulfill) {

            process.nextTick(function () {
                if (!(self.scope in mockDB))
                {
                    mockDB[self.scope] = {};
                }
                if (!(self.uuid in mockDB[self.scope]))
                {
                    mockDB[self.scope][self.uuid] = {};
                }

                fulfill('WHAT SHOULD I RETURN? ' + JSON.stringify(mockDB[self.scope][self.uuid]));
            });

        });
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
