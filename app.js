'use strict';

var config = require('config'),
    logger = require('./app/lib/config-log4js').getLogger('app'),
    Service = require('./app/Service');

logger.info('app started');
new Service().start(config.get('port'));
