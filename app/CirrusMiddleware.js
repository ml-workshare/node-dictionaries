// CirrusMiddleware.js authenticate against the cirrus server and add a currentUuid to the request

'use strict';

var category = 'CirrusMiddleware',
    logger = require('./lib/config-log4js').getLogger(category),
    debug = require('debug')(category);

class CirrusMiddleware {
    constructor(options) {
        void options;
        debug('constructor()');
    }

    addsCurrentUuid(request, response, next) {
        debug('addsCurrentUuid', request);
        process.nextTick(function () {
            // sorry, mock Uuid for the moment, implementation to come...
            request.currentUuid = 'uUiD.UuId.uUiD.UuId';
            logger.info('currentUuid: ' + request.currentUuid);
            next(request,  response);
        });
    }
}

module.exports = CirrusMiddleware;
debug('exports', module.exports);
