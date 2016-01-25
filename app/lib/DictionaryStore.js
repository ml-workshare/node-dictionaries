'use strict';

const category = 'DictionaryStore',
    logger = require('./config-log4js').getLogger(category),
    debug = require('debug')(category),
    getDb = require('./DictionaryDatabase'),
    MongoFiltersSanitizer = require('./MongoFiltersSanitizer');

class DictionaryStore {
    constructor(options) {
        debug('constructor()');
        this.uuid = options.uuid;
        this.scope = options.scope;
        this.db = options.database || getDb();
        this.sanitizer = new MongoFiltersSanitizer();
    }

    willSet(name, value) {
        debug('willSet()', name, value);
        const uuid = this.uuid,
            dbPromise = this.db.get(this.scope)
                .findAndModify(
                    { uuid, name },
                    { uuid, name, value },
                    { upsert: true }
                );

        return this._willHandleDocument(dbPromise, name);
    }

    willDelete(name) {
        debug('willDelete()', name);
        const self = this,
            uuid = this.uuid;
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
        const uuid = this.uuid,
            dbPromise = this.db.get(this.scope).findOne({ uuid, name });

        return this._willHandleDocument(dbPromise, name);
    }

    willGetCollection(filters) {
        debug('willGetCollection()', filters);
        const self = this,
            mongoFilters = this.sanitizer.sanitize(filters);
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

    _willHandleDocument(promise, name) {
        debug('_willHandleDocument() for name: ', name);
        const self = this;
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
            const result = document.value;
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

const DictionaryStoreFactory = {
    create: function (options) {
        return new DictionaryStore(options);
    }
};

module.exports = DictionaryStoreFactory;
debug('exports', module.exports);

