// DictionaryStore.js - (sorry) Dictionary storage for a given user and scope

'use strict';

var category = 'DictionaryStore',
    logger = require('./config-log4js').getLogger(category),
    debug = require('debug')(category),
    mockDB = {};

class DictionaryStore {
    constructor(options) {
        debug('constructor()');
        this.uuid = options.uuid;
        this.scope = options.scope;
    }

    willSet(name, valueObj) {
        debug('willSet()', name, valueObj);
        var self = this;
        return new Promise(function (fulfill, reject) {
            process.nextTick(function () {
                try {
                    if (!(self.scope in mockDB))
                    {
                        mockDB[self.scope] = {};
                    }
                    if (!(self.uuid in mockDB[self.scope]))
                    {
                        mockDB[self.scope][self.uuid] = {};
                    }
                    valueObj.name = name;
                    mockDB[self.scope][self.uuid][name] = valueObj;

                    fulfill(valueObj);
                    //reject(new Error('what'));void fulfill;
                }
                catch (error) {
                    reject(error);
                }
            });

        });
    }

    willDelete(name) {
        debug('willDelete()', name);
        var self = this;
        return new Promise(function (fulfill, reject) {

            process.nextTick(function () {
                /* jshint maxcomplexity: 6 */
                try {
                    var valueObj = true;

                    if (!(self.scope in mockDB))
                    {
                        valueObj = false;
                    }
                    if (valueObj && !(self.uuid in mockDB[self.scope]))
                    {
                        valueObj = false;
                    }
                    if (valueObj && !(name in mockDB[self.scope][self.uuid]))
                    {
                        valueObj = false;
                    }
                    if (!valueObj) {
                        reject('Not Found');
                    }
                    else {
                        valueObj = mockDB[self.scope][self.uuid][name];
                        delete mockDB[self.scope][self.uuid][name];

                        fulfill(valueObj);
                    }
                }
                catch (error) {
                    reject(error);
                }
            });

        });
    }

    willGet(name) {
        debug('willGet()', name);
        var self = this;
        return new Promise(function (fulfill, reject) {

            process.nextTick(function () {
                /* jshint maxcomplexity: 6 */
                try {
                    var valueObj = true;

                    if (!(self.scope in mockDB))
                    {
                        valueObj = false;
                    }
                    if (valueObj && !(self.uuid in mockDB[self.scope]))
                    {
                        valueObj = false;
                    }
                    if (valueObj && !(name in mockDB[self.scope][self.uuid]))
                    {
                        valueObj = false;
                    }
                    if (!valueObj) {
                        reject('Not Found');
                    }
                    else {
                        valueObj = mockDB[self.scope][self.uuid][name];

                        fulfill(valueObj);
                    }
                }
                catch (error) {
                    reject(error);
                }
            });

        });
    }

    _filter(valueObjs, filters) {
        var match = true;
        Object.keys(filters).forEach(function (key) {
            if (!(key in valueObjs)) {
                match = false;
            }
            else if (valueObjs[key] !== filters[key]) {
                match = false;
            }
        });
        return match;
    }

    willGetCollection(filters) {
        debug('willGetCollection()', filters);
        var self = this;
        filters = filters || {};
        return new Promise(function (fulfill, reject) {

            process.nextTick(function () {
                /* jshint maxcomplexity: 5 */
                try {
                    var valueObj = true;

                    if (!(self.scope in mockDB))
                    {
                        valueObj = false;
                    }
                    if (valueObj && !(self.uuid in mockDB[self.scope]))
                    {
                        valueObj = false;
                    }

                    if (!valueObj) {
                        reject('Not Found');
                    }
                    else {
                        var dictionary = mockDB[self.scope][self.uuid];
                        valueObj = [];
                        Object.keys(dictionary)
                            .forEach(function (key) {
                                var valueObjs = dictionary[key];
                                if (self._filter(valueObjs, filters)) {
                                    valueObj.push(valueObjs);
                                }
                            });

                        fulfill(valueObj);
                    }
                }
                catch (error) {
                    reject(error);
                }
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
