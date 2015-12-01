'use strict';

const //App = require('.'),
    config = require('config'),//App.config,
    logger = require('./app/lib/config-log4js').getLogger('app'),//App.logger.getLogger('app'),
    Service = require('./app/Service');//App.Service;

logger.info('app started');
new Service().start(config.get('port'));
