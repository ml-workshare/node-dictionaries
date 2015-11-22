'use strict';

const category = 'Dictionary',
    mongodb = 'localhost/dictionaries';

var logger = require('./config-log4js').getLogger(category),
    debug = require('debug')(category),
    db = require('monk')(mongodb);

class DictionaryStore {
    constructor(options) {
        debug('constructor()');
        this.uuid = options.uuid;
        this.scope = options.scope;
    }

    willSet(name, value) {
        debug('willSet()', name, value);
        var uuid = this.uuid;
        var dbPromise = db.get(this.scope)
            .findAndModify(
                { uuid, name },
                { uuid, name, value },
                { upsert: true }
            );
        return this._willHandleDocument(dbPromise, name);
    }

    willDelete(name) {
        debug('willDelete()', name);
        var uuid = this.uuid,
            self = this;
        return new Promise(function (fulfill, reject) {
            self.willGet(name).then(function (document) {
                db.get(self.scope).remove({ uuid, name });
                fulfill(document);
            }).catch(function (error) {
                reject(self.getErrorSync(error));
            });
        });
    }

    willGet(name) {
        debug('willGet()', name);
        var uuid = this.uuid;
        var dbPromise = db.get(this.scope).findOne({ uuid, name });
        return this._willHandleDocument(dbPromise, name);
    }

    willGetCollection(filters) {
        debug('willGetCollection()', filters);
        var self = this;
        var mongoFilters = this._sanitizeFilters(filters);
        mongoFilters.uuid = this.uuid;
        return new Promise(function (fulfill, reject) {
            db.get(self.scope).find(mongoFilters).success(function (documents) {
                fulfill(documents.map(function (document) {
                    return self._handleDocument(document);
                }));
            }).error(function (err) {
                reject(self.getErrorSync(err));
            });
        });
    }

    _sanitizeFilters(filters) {
        var mongoFilters = {};
        if (!filters) {
            return mongoFilters;
        }
        Object.keys(filters).forEach(function (key) {
            debug(key);
            mongoFilters['value.' + key] = filters[key];
        });
        debug(mongoFilters);
        debug(filters);
        return mongoFilters;
    }

    _willHandleDocument(promise, name) {
        debug('_willHandleDocument()');
        var self = this;
        return new Promise(function (fulfill, reject) {
            promise.success(function (document) {
                fulfill(self._handleDocument(document, name));
            }).error(function (err) {
                reject(self.getErrorSync(err));
            });
        });
    }

    _handleDocument(document, name) {
        if (document) {
            var result = document.value;
            result.name = name || document.name;
            return result;
        } else {
            return document;
        }
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
