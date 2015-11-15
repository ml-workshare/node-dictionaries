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
                    value = JSON.parse(value);
                    value.name = name;
                    value = JSON.stringify(value);
                    mockDB[self.scope][self.uuid][name] = value;

                    fulfill(value);
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
                    var value = true;

                    if (!(self.scope in mockDB))
                    {
                        value = false;
                    }
                    if (value && !(self.uuid in mockDB[self.scope]))
                    {
                        value = false;
                    }
                    if (value && !(name in mockDB[self.scope][self.uuid]))
                    {
                        value = false;
                    }
                    if (!value) {
                        reject('Not Found');
                    }
                    else {
                        value = mockDB[self.scope][self.uuid][name];
                        delete mockDB[self.scope][self.uuid][name];

                        fulfill(value);
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
                    var value = true;

                    if (!(self.scope in mockDB))
                    {
                        value = false;
                    }
                    if (value && !(self.uuid in mockDB[self.scope]))
                    {
                        value = false;
                    }
                    if (value && !(name in mockDB[self.scope][self.uuid]))
                    {
                        value = false;
                    }
                    if (!value) {
                        reject('Not Found');
                    }
                    else {
                        value = mockDB[self.scope][self.uuid][name];

                        fulfill(value);
                    }
                }
                catch (error) {
                    reject(error);
                }
            });

        });
    }

    _filter(values, filters) {
        var match = true;
        Object.keys(filters).forEach(function (key) {
            if (!(key in values)) {
                match = false;
            }
            else if (values[key] !== filters[key]) {
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
                    var value = true;

                    if (!(self.scope in mockDB))
                    {
                        value = false;
                    }
                    if (value && !(self.uuid in mockDB[self.scope]))
                    {
                        value = false;
                    }

                    if (!value) {
                        reject('Not Found');
                    }
                    else {
                        var dictionary = mockDB[self.scope][self.uuid];
                        value = [];
                        Object.keys(dictionary)
                            .forEach(function (key) {
                                var values = JSON.parse(dictionary[key]);
                                if (self._filter(values, filters)) {
                                    value.push(values);
                                }
                            });

                        fulfill(JSON.stringify(value));
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
