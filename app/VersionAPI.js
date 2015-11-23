'use strict';

const category = 'VersionAPI',
    versionPath = '../config/version.json',
    packagePath = '../package.json';

var logger = require('./lib/config-log4js').getLogger(category),
    debug = require('debug')(category),
    privates = new WeakMap(),
    _getPackageJSON,
    _getVersionJSON,
    _getJSON,
    _prepareVersion,
    _formatResponse,
    _setPrivate;

class VersionAPI {
    constructor(mockPackage, mockVersion) {
        debug('constructor()');
        privates.set(this, {});
        _getPackageJSON.call(this, mockPackage);
        _getVersionJSON.call(this, mockVersion);
        _prepareVersion.call(this);
    }

    get(request, response) {
        debug('get()');
        void request;

        response
            .type('text')
            .status(this.status)
            .send(this.formattedResponse);
    }

    get status () {
        return privates.get(this).status;
    }

    get formattedResponse () {
        return privates.get(this).formattedResponse;
    }

    toString () {
        return category + ' ' + JSON.stringify(privates.get(this));
    }

    get _privates () {
        return JSON.parse(JSON.stringify(privates.get(this)));
    }
}

_setPrivate = function (key, value) {
    var _privates = privates.get(this);
    _privates[key] = value;
    return this;
};

_getPackageJSON = function (mockPackage) {
    try {
        _setPrivate.call(this, 'packageJSON', _getJSON(mockPackage, packagePath));
    }
    catch (error) {
        logger.warn(process.pid + ' ', error);
    }
};

_getVersionJSON = function (mockVersion) {
    try {
        _setPrivate.call(this, 'versionJSON', _getJSON(mockVersion, versionPath));
    }
    catch (error) {
        _setPrivate.call(this, 'versionJSON', {});
        logger.warn(process.pid + ' ', error);
    }
};

_getJSON = function (pathOrObject, defaultPath) {
    var path = (typeof pathOrObject === 'string') ? pathOrObject : defaultPath;
    return typeof pathOrObject === 'object' ?
        pathOrObject : require(path);
};

_prepareVersion = function () {
    var status,
        result = {},
        packageJSON = privates.get(this).packageJSON,
        versionJSON = privates.get(this).versionJSON;

    if (packageJSON && packageJSON.version) {
        status = 200;
        result['Application Version'] = packageJSON.version;
        result['Application Name'] = 'api-location-node';
        result['Build Time'] = versionJSON.buildTime;
        result['Builder Number'] = versionJSON.builderNumber;
        result['Build Id'] = versionJSON.buildId;
        result['Job name'] = versionJSON.jobName;
        result['Build tag'] = versionJSON.buildTag;
        result['Git commit'] = versionJSON.gitCommit;
    } else {
        status = 500;
        result.error = 'We are unable to determine the version';
    }
    _setPrivate.call(this, 'status', status);
    _setPrivate.call(this, 'formattedResponse', _formatResponse(result));
};

_formatResponse = function (keyValues) {
    var result = [];
    Object.keys(keyValues).forEach(function (key) {
        result.push(key + '=' + keyValues[key]);
    });
    return result.join('\n');
};

module.exports = VersionAPI;
