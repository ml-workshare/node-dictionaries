/*
    setup.js

    common setup for all test plans. test framework globals defined.
    log4js configured to not intrude when testing objects which have
    logging calls.

*/

/* jshint maxcomplexity: 2 */

'use strict';

/*
    Ensure environment variables don't mess with config and logging
    while running the tests
*/
process.env.NODE_CONFIG = '';
process.env.NODE_ENV = 'mocha-test-plan';
process.env.NODE_CONFIG_DIR = 'test/app/lib/config';
process.env.LOG4JS_CONFIG = '';

function _checkLogDir ()
{
    var path = require('path'),
        dir = path.resolve(process.cwd(), 'log'),
        fs = require('fs');

    fs.stat(dir, function(error)
    {
        if (error)
        {
            var msg = 'Test plan LOG directory must exist with' +
                ' write permissions. Please create ' +
                dir + ' ' + error;
            console.trace(msg);
            throw new Error(msg);
        }
    });
}

_checkLogDir();

var config = require('config'),
    log = require('../app/lib/config-log4js');

global.chai = require('chai');
global.should = chai.should();
global.expect = chai.expect;
global.assert = chai.assert;
global.chai.use(require('chai-as-promised'));
global.AssertionError = chai.AssertionError;
global.sinon = require('sinon');

global.swallow = function (thrower) {
    try {
        thrower();
    } catch (e) { }
};

global.testAsync = function (asyncDone, thrower) {
    try {
        thrower();
        asyncDone();
    }
    catch (error) {
        asyncDone(new Error(error));
    }
};

var sinonChai = require('sinon-chai');
global.chai.use(sinonChai);
require('sinon-as-promised');

/*
    Set the logging mode from the config file mocha-test-plan.json

    Because modules contain logging and one test plan tests the logging module
    there is fiddling needed with the logs.

    If you are testing an error you will want to turn off logging for that test
*/
global.setLogging = function (mode) {

    switch (mode) {
        case 'on':
            log.configure(config.get('log4js'));
            break;
        default:
            log.configure(config.get(mode));
    }
};

