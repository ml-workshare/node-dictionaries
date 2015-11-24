'use strict';

const category = 'DictionaryStore';

var logger = require('./config-log4js').getLogger(category),
    debug = require('debug')(category),
    getDb = require('./DictionaryDatabase');

class DictionaryStore {
    constructor(options) {
        debug('constructor()');
        this.uuid = options.uuid;
        this.scope = options.scope;
        this.db = options.database || getDb();
        this.db.get('users');
    }

    willSet(name, value) {
        debug('willSet()', name, value);
        var uuid = this.uuid;
        var dbPromise = this.db.get(this.scope)
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
        return new Promise((fulfill, reject) => {
            self.willGet(name).then((document) => {
                debug('willDelete(), deleting documents: ', document);
                self.db.get(self.scope).remove({ uuid, name });
                fulfill(document);
            }, (error) => {
                reject(self.getErrorSync(error));
            });
        });
    }

    willGet(name) {
        debug('willGet()', name);
        var uuid = this.uuid;
        var dbPromise = this.db.get(this.scope).findOne({ uuid, name });
        return this._willHandleDocument(dbPromise, name);
    }

    willGetCollection(filters) {
        debug('willGetCollection()', filters);
        var self = this;
        var mongoFilters = this._sanitizeFilters(filters);
        mongoFilters.uuid = this.uuid;
        return new Promise((fulfill, reject) => {
            self.db.get(self.scope).find(mongoFilters).then((documents) => {
                fulfill(documents.map((document) => {
                    return self._handleDocument(document);
                }));
            }, (err) => {
                reject(self.getErrorSync(err));
            });
        });
    }

    _sanitizeFilters(filters) {
        var mongoFilters = {};
        if (!filters) {
            debug('_sanitizeFilters(), result: ', mongoFilters);
            return mongoFilters;
        }
        Object.keys(filters).forEach((key) => {
            debug(key);
            mongoFilters['value.' + key] = filters[key];
        });
        debug('_sanitizeFilters(), result: ', mongoFilters);
        return mongoFilters;
    }

    _willHandleDocument(promise, name) {
        debug('_willHandleDocument() for name: ', name);
        var self = this;
        return new Promise((fulfill, reject) => {
            promise.then((document) => {
                debug('_willHandleDocument(), got document: ', document);
                fulfill(self._handleDocument(document, name));
            }, (err) => {
                debug('Promise rejected with: ', err);
                reject(self.getErrorSync(err));
            });
        });
    }

    _handleDocument(document, name) {
        debug('_handleDocument(): ', document, name);
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
