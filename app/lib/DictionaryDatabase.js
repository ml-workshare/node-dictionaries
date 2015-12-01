'use strict';

const category = 'DictionaryDatabase',
    logger = require('./config-log4js').getLogger(category),
    debug = require('debug')(category),
    config = require('config').get('DictionaryDatabase');

var db;

const getDatabase = () => {
    if (db) {
        debug('Returning memoized database', db);
        return db;
    } else {
        debug('config', config);
        const monkConfig = config.host + ':' + config.port +
            '/' + config.database;
        logger.info('Attempting to connect to MongoDB using config: ', monkConfig);
        debug('Connecting to MongoDB with config: ', monkConfig);
        db = require('monk')(monkConfig);
        debug('Connected to database', db);
        return db;
    }
};

module.exports = getDatabase;
