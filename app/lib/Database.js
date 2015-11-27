'use strict';

const category = 'DictionaryDb';

var logger = require('./config-log4js').getLogger(category),
    debug = require('debug')(category),
    config = require('config'),
    dbConfig = config.database,
    db;

var getDatabase = () => {
    if (db) {
        debug('Returning memoized database', db);
        return db;
    } else {
        debug('dbConfig', dbConfig);
        var monkConfig = dbConfig.host + ':' + dbConfig.port +
            '/' + dbConfig.database;
        logger.info('Attempting to connect to MongoDB using config: ', monkConfig);
        debug('Connecting to MongoDB with config: ', monkConfig);
        db = require('monk')(monkConfig);
        debug('Connected to database', db);
        return db;
    }
};

module.exports = getDatabase;
debug('exports', module.exports);