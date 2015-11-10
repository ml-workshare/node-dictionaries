'use strict';

var config = require('config'),
    log = require('./app/lib/config-log4js').getLogger('app'),
    Service = require('./app/Service');

log.info('app started');
new Service().start(config.get('port'));
